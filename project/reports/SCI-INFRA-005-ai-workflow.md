# SCI-INFRA-005 — Audit tài nguyên Claude và kế hoạch pipeline Claude API

_Ngày 2026-11-06. Báo cáo lập kế hoạch: **chưa** cấu hình API key, **chưa** gửi batch, **chưa** đổi cấu hình hay kiến trúc._

---

## 1. Những gì đã hoàn thành (bước 1)

| Hạng mục | Kết quả |
|---|---|
| Báo cáo QA 3e | 3 báo cáo QA + 2 báo cáo kiểm tra lại (`project/reports/SCI-3E-MATH-00{1,2,9}-*.md`) |
| Lỗi đã xác minh | Đã sửa toàn bộ lỗi chặn/lớn/nhỏ thuộc chương; lỗi dùng chung đã sửa trong engine (làm tròn, nhập « % »/« € »/« 5,6.10^-6 »/« 10⁻⁶ », phân số tối giản trong calcul-flash, kiểm tra tham số `vary` không đổi) |
| Lỗi phát hiện thêm khi kiểm tra giao diện | SVG « bande de fractions » bị bộ minify SWC của Next cắt hỏng (`width="300<text…`) → thay bằng giá trị cố định; đã kiểm tra lại trên bundle |
| Kiểm thử | `npm test` 428/428 · `tsc` 0 lỗi · ESLint 0 lỗi (1 cảnh báo cũ) · `npm run build` OK · e2e Playwright 3 chương 3e: 121/121 · kiểm tra giao diện desktop + mobile (lỗi console, tràn ngang, KaTeX, trò chơi, bàn phím): đạt |
| Xuất bản | **Arithmétique** (36 bài) và **Ratios, pourcentages et évolutions** (33 bài): đã xuất bản trong menu 3e. **Fractions, puissances et racines carrées**: vẫn là bản nháp — 2 lỗi lớn đã kiểm bằng script (0/21 000 lượt sinh lỗi) nhưng chưa có kiểm tra lại độc lập cho các lỗi nhỏ |
| Công cụ mới thay AI | `scripts/ui-check.ts` (kiểm tra giao diện QA5 bằng script), biến `ONLY=` cho `scripts/e2e.ts` (chạy e2e theo chương) |
| Batch 2 | Chưa triển khai (chờ duyệt) |

## 2. Nguyên nhân tiêu thụ tài nguyên lớn (đo trong phiên này)

| Nguyên nhân | Bằng chứng | Mức ảnh hưởng |
|---|---|---|
| **Mọi agent chạy Opus** (fork kế thừa model của phiên chính; agent `general-purpose` cũng kế thừa) | 11 lượt agent, mỗi lượt 170 000–320 000 token | Rất lớn |
| **Fork kế thừa toàn bộ ngữ cảnh** phiên chính (audit, đọc file, kế hoạch) | 3 tác giả chạy song song → chạm giới hạn 5 giờ giữa chừng, phải chạy lại | Rất lớn |
| **Vòng QA nặng**: 1 review + 1 sửa + 1 kiểm tra lại cho mỗi chương, mỗi lần đọc lại file 80–100 KB (~30 000 token) | Tổng ≈ 2,9 triệu token cho agent phụ ở batch 1 | Lớn |
| **AI tự viết script kiểm tra dùng một lần** (sinh lại 200–3 000 seed) ở mỗi review | 5 agent viết 5 bộ script tương tự trong scratchpad | Trung bình — có thể thay bằng script cố định trong repo |
| **Ngữ cảnh khởi động bị phình**: ~10 MCP server và ~70 skill không liên quan được nạp mỗi phiên (quảng cáo, SEO, marketing, hosting, Drive…) | Danh sách công cụ/skill trong system prompt | Trung bình, lặp lại ở mọi phiên và mọi agent |
| **Chi phí khởi động lại**: worker khởi động lại + đợi reset 5 giờ → phải nạp lại ngữ cảnh | 2 lần trong phiên | Trung bình |
| Thiếu `CLAUDE.md` của dự án → mỗi phiên phải đọc lại README, `agents.md`, schema, file chương mẫu 73 KB để hiểu quy ước | Audit đầu phiên ≈ 15 lượt đọc | Trung bình |

## 3. Cấu hình đề xuất thay đổi (chờ duyệt)

**Hiện trạng audit**
- `CLAUDE.md`: **không có** trong repo; quy ước nằm rải rác ở `README.md`, `project/agents.md`, `project/STATUS.md`, `project/maths-3e-progress.md` (có trùng lặp giữa STATUS và progress).
- Custom agents: **không có** `.claude/agents/`; 14 « agent » trong `project/agents.md` chỉ là vai trò trên giấy, không gắn model.
- MCP: cần cho dự án = `github`, `claude-code-remote` (môi trường). Không cần: `advisorppc`, `HYPD…`, `Data_Bloo…`, `Google_Drive`, `Claude_Docs` (trừ khi muốn tài liệu cộng tác), plugin `hostinger`, `marketing:*`, `claude-seo`. Notion (`plugin:marketing:notion`) **cần** nếu Notion là nguồn chính — hiện chưa được cấp quyền.
- Skills: cần `claude-api` (khi làm pipeline), `run`; còn lại (SEO, ads, marketing, docx/pptx/xlsx…) không dùng trong dự án này.
- Các plugin/skill trên được đồng bộ ở **cấp tài khoản claude.ai**, không nằm trong repo.

**Thay đổi đề xuất**
1. Tạo `CLAUDE.md` ngắn (≤ 80 dòng): lệnh kiểm thử, quy ước chương, nơi đọc trạng thái (`project/maths-3e-progress.md`), quy tắc « script trước, AI sau ». Gộp `project/STATUS.md` vào progress để có một nguồn duy nhất.
2. Tạo `.claude/agents/` với model cố định:
   - `chapter-author` → `sonnet`
   - `chapter-reviewer` → `sonnet` (một reviewer cho 6 tiêu chí, không fork)
   - `extractor` → `haiku`
   - Không tạo agent Opus; Opus chỉ ở phiên chính khi có lỗi kiến trúc.
3. `.claude/settings.json` của dự án: tắt các plugin không liên quan (`enabledPlugins: { … : false }`) và đặt model mặc định cho agent phụ là Sonnet. Tắt ở cấp tài khoản thì do anh/chị thực hiện trong cài đặt claude.ai.
4. Quy tắc vận hành: tối đa **2 agent đồng thời**; không dùng fork cho tác vụ sản xuất (fork mang theo toàn bộ ngữ cảnh); kiểm tra lại bằng script trước, chỉ gọi reviewer AI cho phần cần phán đoán sư phạm/ngôn ngữ.

## 4. Kiến trúc API pipeline (đề xuất)

```
Chương trình chính thức (BO/Éduscol, PDF đã lưu)
  → [Haiku]  Trích xuất mục tiêu, có trích dẫn vị trí nguồn        → research/curriculum/*.json   (đã có cho 6e–3e)
  → [Sonnet] Hồ sơ chương (định nghĩa, phạm vi, lỗi thường gặp)     → research/dossiers/<id>.md
  → [Sonnet] Bài giảng JSON có cấu trúc (theo LessonSchema)         → content/<id>/lesson.json
  → [Sonnet] Bài tập: TS generator (vary) theo khuôn mẫu sẵn        → src/lib/chapters/data/<id>.ts
  → [Script] Kiểm tra xác định: zod schema, doneIssues, 40–3 000 seed, đáp án hoàn hảo = 100 %,
             chẩn đoán ≠ đáp án, trùng lặp, NaN, tsc, eslint, build, ui-check, e2e ONLY=
       ↳ lỗi → gửi lại đúng thông báo lỗi cho Sonnet (tối đa 2 vòng), không gửi lại cả ngữ cảnh
  → [Sonnet] QA sư phạm + ngôn ngữ (1 lượt, đọc file + báo cáo script) → project/reports/<task>-QA.md
  → [Người]  Duyệt → reviewStatus/publicationStatus → GitHub (PR) → website
```

| Yêu cầu | Cách đáp ứng |
|---|---|
| Message Batches API | Dùng cho các bước không cần tương tác: hồ sơ chương, bài giảng JSON, QA ngôn ngữ, sinh hàng loạt chương (giảm 50 % chi phí; kết quả trả trong ≤ 24 giờ, đọc theo `custom_id`). Vòng sửa lỗi sau test thì gọi thường. |
| Prompt caching | Phần đầu cố định cho mọi chương: hướng dẫn hệ thống + `schema.ts` + một chương mẫu đã duyệt + quy ước (~35 000–40 000 token) → đặt `cache_control`. Đọc cache = 0,1× giá input. Chỉ có lợi khi nhiều request cùng tiền tố trong thời gian TTL (5 phút, hoặc 1 giờ). Kiểm chứng bằng `usage.cache_read_input_tokens`. |
| Nguồn hợp pháp, truy vết được | Chỉ dùng file nguồn đã lưu trong `research/` kèm URL + ngày truy cập; prompt cấm dùng kiến thức không có trong nguồn cho phần « périmètre officiel »; mỗi mục tiêu giữ `officialRef`. Nguồn không truy cập được → `SOURCE_INACCESSIBLE`, bước sau bị chặn. |
| Không suy đoán | Model trả JSON có trường `sources[]` bắt buộc; script từ chối mục tiêu không có trích dẫn khớp với inventory. |
| Không lộ API key | `ANTHROPIC_API_KEY` chỉ trong `.env` (đã nằm trong `.gitignore`) hoặc secret của môi trường; `.env.example` chỉ có tên biến. |
| Chạy lại từng chương, không ghi đè dữ liệu đã duyệt | `pipeline/state.json`: mỗi chương × mỗi bước có `status` và `hash` đầu vào. Bước đã `approved` bị bỏ qua; `--chapter <id> --step <x> --force` mới chạy lại. |
| Tạm dừng / tiếp tục | Trạng thái ghi sau mỗi bước; batch đã gửi lưu `batch_id` → lệnh `resume` chỉ thu kết quả. |
| Giới hạn ngân sách | `--budget-usd` cho mỗi lần chạy; ước tính trước bằng `count_tokens`, ghi chi phí thực từ `usage` sau mỗi request vào `pipeline/costs.jsonl`; dừng khi vượt ngưỡng. |
| Không dùng AI cho kiểm thử xác định được | Toàn bộ bước [Script] chạy trước; AI chỉ nhận danh sách lỗi đã lọc. |

## 5. Chi phí API ước tính và cách đo chi phí thực

Giá hiện hành theo tài liệu Anthropic (USD / 1 triệu token, input / output): Opus 5.5: 4 / 20 · Sonnet 5.5: 2 / 10 · Haiku 5.5: 0,10 / 0,50. Batches: −50 %. Ghi cache: 1,25× input (TTL 5 phút). Đọc cache: 0,1× input.

**Giả định cho một chương** (dựa trên kích thước thực của batch 1: file chương 80–100 KB ≈ 30 000 token)

| Bước | Model | Input (cache / mới) | Output (gồm suy luận) | Chi phí thường | Qua Batches |
|---|---|---|---|---|---|
| Hồ sơ chương | Sonnet | 35k cache + 10k | 6k | ~$0,09 | ~$0,05 |
| Bài giảng JSON | Sonnet | 35k cache + 8k | 12k | ~$0,15 | ~$0,08 |
| Bài tập (TS) | Sonnet | 35k cache + 15k | 45k | ~$0,49 | ~$0,25 |
| 2 vòng sửa theo lỗi script | Sonnet | 2 × (35k cache + 35k) | 2 × 15k | ~$0,45 | — (gọi thường) |
| QA sư phạm + ngôn ngữ | Sonnet | 10k + 35k | 8k | ~$0,17 | ~$0,09 |
| **Tổng một chương** | | | | **≈ $1,3** | **≈ $0,9** |

- **13 chương 3e còn lại + phần phương pháp/annales DNB** (≈ 16 đơn vị): ≈ **$15–25**.
- Dự phòng ×2 cho chương khó (hình học có SVG, Scratch): **trần đề xuất $50**.
- Nếu dùng Opus 5.5 cho cùng khối lượng: ≈ ×2 (≈ $40–50).
- Haiku cho trích xuất: không đáng kể (< $1 tổng).

**Đo chi phí thực**
- Ghi `usage.input_tokens`, `usage.cache_creation_input_tokens`, `usage.cache_read_input_tokens` và `usage.output_tokens` của từng response vào `pipeline/costs.jsonl`, rồi nhân với bảng giá (lưu trong `pipeline/prices.json`).
- Đối chiếu hằng tuần với Console → Usage/Cost, hoặc Admin API `cost_report` nếu có Admin key.
- Pilot trước với 1 chương (Calcul littéral) để thay số giả định bằng số đo thật.

## 6. File cần tạo hoặc sửa (khi được duyệt)

| File | Hành động |
|---|---|
| `CLAUDE.md` | Tạo (ngắn gọn, quy ước + lệnh) |
| `.claude/agents/chapter-author.md`, `chapter-reviewer.md`, `extractor.md` | Tạo (frontmatter `model:`) |
| `.claude/settings.json` | Tạo (tắt plugin không liên quan cho dự án) |
| `project/STATUS.md` | Gộp vào `project/maths-3e-progress.md` |
| `scripts/validate-chapter.ts` | Tạo: gom các kiểm tra xác định (zod, doneIssues, quét seed, chẩn đoán, trùng lặp) thành một lệnh, xuất JSON lỗi gọn cho AI |
| `pipeline/run.ts` | Tạo: điều phối các bước, state, resume, `--budget-usd`, `--chapter`, `--step`, `--force`, `--batch` |
| `pipeline/prompts/*.md` | Tạo: prompt cố định (phần được cache) |
| `pipeline/state.json`, `pipeline/costs.jsonl`, `pipeline/prices.json` | Tạo (state và costs có thể đưa vào `.gitignore` hoặc commit tùy nhu cầu truy vết) |
| `package.json` | Thêm `@anthropic-ai/sdk`, script `pipeline`, `validate:chapter`, `ui-check` |
| `.env.example` | Thêm `ANTHROPIC_API_KEY=` (để trống) |

## 7. Thứ tự triển khai tiếp theo (đề xuất)

1. Duyệt báo cáo này (chọn mục 3 và 4 được chấp nhận).
2. Áp dụng cấu hình rẻ và an toàn: `CLAUDE.md`, `.claude/agents` (Sonnet/Haiku), tắt plugin không liên quan. Đo lại token khởi động của một phiên.
3. `scripts/validate-chapter.ts`: thay các script tạm của reviewer; dùng ngay cho lần kiểm tra lại chương Puissances, rồi xuất bản chương nếu đạt.
4. `pipeline/run.ts` với 1 chương pilot (batch 2 : Calcul littéral), chế độ gọi thường, ngân sách $5. Đo chi phí thật và chất lượng (số vòng sửa, lỗi QA).
5. Bật Batches và prompt caching cho các bước không tương tác; chạy batch 2–3 trong giới hạn ngân sách đã duyệt.
6. Mở rộng cho các batch tiếp theo theo manifest; duyệt thủ công trước mỗi lần xuất bản.

**Điều kiện tiên quyết cần anh/chị cung cấp**
- API key: đặt trong `.env` hoặc secret của môi trường, không gửi trong hội thoại.
- Ngân sách tối đa.
- Có cho phép tắt plugin ở cấp tài khoản hay không.
- URL Notion và quyền connector Notion, nếu Notion vẫn là nguồn chính.
