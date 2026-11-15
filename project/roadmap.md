# Feuille de route : extension collège & lycée (directive du porteur de projet)

_Texte d'origine du porteur de projet (vietnamien), reçu le 2026-11-08, conservé tel quel. Il prime sur les plans antérieurs en cas de conflit. Avancement par gate : `project/reports/ROADMAP-G0-audit.md` (Gate 0) puis `project/STATUS.md`._

_Attention : les « Gate 0…5 » ci-dessous sont des étapes de la feuille de route ; ils ne doivent pas être confondus avec les gates G0/G1/G2 du collecteur de sources (`research/sources/`), mentionnés au § 2._

---

## 1. Mục tiêu
Mở rộng `NguyenthanhTuyen0710/sciences-interactives` thành thư viện tương tác tiếng Pháp (tutoiement) cho **Mathématiques** và **Physique-Chimie**, từ 6e đến Terminale, gồm Brevet và Bac. Nội dung phải nguyên bản, bám chương trình chính thức, có kiểm duyệt thủ công trước khi publish.

## 2. Ràng buộc kiến trúc (bắt buộc)
- Chỉ mở rộng: `generate-lessons.yml`, `collect-sources.yml`, `pipeline/run.ts`, `pipeline/sources/`, `pipeline/ledger.ts`, `research/curriculum/`, `research/sources/`, `ChapterSchema`, components và game engine hiện có, Data Store hiện có.
- **Không** tạo workflow, pipeline, hệ điều phối hay kho lưu trữ mới. Không viết lại phần đã chạy tốt.
- Tuân thủ G0/G1/G2 đã duyệt. Không vượt robots.txt, Cloudflare, paywall, DRM. Sách thương mại chỉ dùng metadata hoặc phần được phép.

## 3. Nguyên tắc tối ưu tài nguyên (áp dụng cho mọi phase)

| Nguyên tắc | Cách thực hiện |
|---|---|
| **Làm một lần** | Mỗi đơn vị công việc (chương, dạng bài, game) có `contentHash` + trạng thái trong ledger. Đã đạt QA và không đổi đầu vào thì bỏ qua. |
| **Rẻ trước, đắt sau** | Thứ tự: validator tất định (schema, đáp án tính được, link, tutoiement regex) → model nhỏ → model lớn chỉ cho phần khó (démonstrations, sujets Bac). |
| **Dùng Batch API + prompt caching** | Gom tác vụ không gấp vào Batch API. Phần prompt cố định (chương trình, schema, style guide) đặt vào cache prefix. |
| **Đầu vào tối thiểu** | Mỗi tác vụ chỉ nhận đúng đoạn chương trình và nguồn liên quan, không nạp cả inventory. |
| **Sinh có cấu trúc** | Xuất JSON theo schema, không văn xuôi. Tránh sinh lại toàn bộ khi chỉ sửa một phần (sửa theo diff cấp trường). |
| **Sửa có mục tiêu** | QA lỗi thì chỉ sinh lại phần lỗi, tối đa 2 vòng sửa. Quá 2 vòng thì đánh dấu `needs-human`, không lặp tiếp. |
| **Cổng ngân sách** | Trước mỗi batch: ước tính chi phí, so với trần còn lại trong ledger. Vượt trần thì dừng và báo. Giữ trần thử nghiệm **10 USD**, không tự nâng. |
| **Claude Code chỉ để thiết kế/sửa code** | Sản xuất nội dung lặp lại chạy qua Claude API + GitHub Actions. |
| **Idempotent và resume** | Checkpoint sau mỗi bước; chạy lại thì tiếp tục từ chỗ dừng; không gửi batch trùng (khóa concurrency + batch ID trong ledger). |

## 4. Quy trình theo cổng (không sang bước sau nếu cổng trước chưa đạt)

**Gate 0: Xác nhận nền tảng**
- Demo Pythagore chạy đủ.
- Audit ngắn: workflow hiện có làm được gì, thiếu gì (chỉ ghi khoảng trống, không viết lại).

**Gate 1: Inventory và coverage matrix**
- Phạm vi: Collège (Maths 6e–3e, Sciences et technologie 6e phần PC, Physique-Chimie 5e–3e, Brevet) và Lycée (Maths Seconde–Terminale, spécialité/complémentaires/expertes, Physique-Chimie, Enseignement scientifique, Bac/EAF/ECE). Voies technologiques/professionnelles kiểm kê riêng.
- Mỗi môn/niveau ghi: văn bản chính thức (BO/Éduscol), phiên bản, năm áp dụng; chapitres → notions → compétences; mức `bắt buộc / củng cố / nâng cao`; trạng thái `đã có / thiếu / chưa xác minh`.
- Lưu ở `research/curriculum/` theo schema máy đọc được. Chỉ có tên chương thì **chưa** tính là xong.

**Gate 2: Source collection**
- Nguồn chuẩn: BO, Éduscol, annales và sujets zéro chính thức. Nguồn tham khảo: Math93, Mission Indigo, Barbazo, Labolycée, tài liệu người dùng cung cấp hợp pháp.
- Chỉ thu thập cho chương đang xử lý (lazy), cache kết quả trong `research/sources/`, không crawl lại nguồn đã có và chưa đổi.
- Dùng nguồn để xác minh kiến thức và lập taxonomy, **không sao chép nguyên văn**.

**Gate 3: Taxonomie (một lần cho mỗi chương)**
- Xác định các nhóm dạng bài thiết yếu theo năng lực, không theo số lượng cố định.
- Mỗi `ExerciseType`: ID, objectif/compétences, prérequis, mức khó, biến thể có ý nghĩa, phương pháp, lỗi thường gặp, liên hệ Brevet/Bac.
- Taxonomy được duyệt thì khóa lại. Nội dung sinh sau tham chiếu ID, không sinh lại.
- Cấm tạo bài chỉ khác số liệu. Biến thể phải khác về cấu trúc hoặc bước suy luận.

**Gate 4: Sản xuất nội dung theo chương** (dossier → chapter → exercises/games → QA)
- **Cours**: définitions, propriétés, théorèmes, démonstrations phù hợp niveau, formules, méthodes, exemples, erreurs fréquentes, fiche de synthèse.
- **Exercices**: theo taxonomy, từ nhập môn đến đa bước, kèm correction détaillée và hướng dẫn rédaction (consignes, ký hiệu, đơn vị, chữ số có nghĩa, từ khóa đề thi, lời giải theo barème).
- **Games** (tái dùng engine hiện có): QCM, texte à trous, association, glisser-déposer, classement, nhận diện hình, thao tác hình học, mô phỏng vật lý, cân bằng phương trình, tìm lỗi trong lời giải, ghi nhớ công thức. Mỗi game gắn một objectif và có phản hồi sư phạm.
- **Évaluation**: kiểm tra nền, luyện theo dạng, mini-évaluation, bài cuối chương, fiche de révision, bài tổng hợp.

**Gate 5: Brevet & Bac**
- Chỉ bắt đầu sau khi chương liên quan đạt QA. Ngân hàng riêng gắn session thi.
- Gồm sujets type, annales được phép, exercices originaux, barèmes, corrections, gestion du temps, lỗi mất điểm.
- Phân loại: chủ đề, năng lực, dạng câu hỏi, độ khó, năm thi. Không trộn chương trình khác nhau.

## 5. Mở rộng pipeline hiện có
Mở rộng `generate-lessons.yml` và `pipeline/run.ts` (không tạo file điều phối mới) với:
- **Input**: niveau, matière, parcours, một chương hoặc nhóm chương, chế độ `dry-run / pilot / production`.
- **Tự phát hiện việc còn thiếu** từ ledger và coverage matrix, chỉ xử lý phần chưa đạt.
- **Checkpoint/resume** sau mỗi bước, kể cả khi batch bị gián đoạn. Truyền dữ liệu giữa các bước qua Data Store/artifacts, không bắt người dùng upload thủ công.
- **Báo cáo mỗi lần chạy**: chi phí, token, tỷ lệ QA đạt, số mục `needs-human`.
- **Cổng duyệt thủ công** trước publish.

## 6. QA (rẻ → đắt)
1. **Tất định (miễn phí)**: schema, đủ trường, ID hợp lệ, đáp án tính lại được (CAS/script), tutoiement, ký hiệu, đơn vị, link, game chạy được (smoke test).
2. **Đối chiếu**: độ phủ objectifs và taxonomy, trùng lặp giữa các bài, tương đồng với nguồn (kiểm tra nguyên bản).
3. **LLM-judge (chỉ cho mục qua tầng 1–2)**: tính đúng kiến thức, chất lượng correction, ngữ pháp Pháp, phù hợp session thi.

Chương chỉ được đánh dấu hoàn thành khi **đủ** nhóm dạng bài và objectifs bắt buộc.

## 7. Coverage matrix
Mở rộng matrix hiện có, hiển thị theo môn → niveau → chương: tổng objectifs / đã verified, cours, nhóm dạng bài đã phủ, số bài hợp lệ, số game hoạt động, corrections/méthodes, nội dung luyện thi, danh sách còn thiếu, trạng thái QA và publication, chi phí API. Matrix là nguồn duy nhất để pipeline quyết định việc cần làm tiếp.

## 8. Lộ trình và ngân sách
1. Gate 0 → Gate 1 → khóa taxonomy (không tốn nhiều API).
2. **Pilot** trên 2–3 chương đại diện (ví dụ Pythagore 4e/3e + một chương Physique-Chimie + một chương Lycée). Đo chi phí/chương, tỷ lệ QA đạt, độ phủ.
3. Báo cáo kết quả pilot và ước tính chi phí toàn bộ, **chờ duyệt**.
4. Sau duyệt mới sản xuất theo từng niveau, mỗi lần một niveau, có cổng ngân sách.

Quy tắc cứng: không chạy hàng loạt khi chưa xác minh nguồn và chi phí; không tự nâng ngân sách; tiếp tục dùng Startup API credits.

## 9. Kết quả cuối
Chọn niveau/môn/chương trong GitHub Actions hiện có → hệ thống dùng chương trình đã xác minh để tạo cours, exercices, corrections, games, révisions, đề luyện thi → tự kiểm tra, lưu checkpoint, có thể tiếp tục nếu gián đoạn → chờ duyệt trước khi publish. Chỉ bổ sung phần còn thiếu, tuyệt đối không tạo hệ thống trùng lặp.
