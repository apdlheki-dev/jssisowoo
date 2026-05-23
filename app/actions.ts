
"use server"

export interface Question {
  question: string
  options: string[]
  correctAnswer: string
}

export async function generateQuestions(formData: FormData): Promise<Question[]> {
  const file = formData.get("file") as File
  const count = Number(formData.get("count") || 5)
  const type = String(formData.get("type") || "اختيار متعدد")

  if (!file) {
    throw new Error("No file provided")
  }

  const bytes = await file.arrayBuffer()
  const textContent = Buffer.from(bytes).toString("utf8").slice(0, 4000)

  const prompt = `
قم بإنشاء ${count} سؤال من نوع ${type} باللغة العربية اعتماداً على هذا المحتوى.

المحتوى:
${textContent}

أرجع JSON فقط بهذا الشكل:
[
 {
   "question":"السؤال",
   "options":["A","B","C","D"],
   "correctAnswer":"A"
 }
]
`

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=PUT_GEMINI_API_KEY_HERE",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    )

    const data = await response.json()

    const content =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    const jsonMatch = content.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      return getDefaultQuestions(count)
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Gemini Error:", error)
    return getDefaultQuestions(count)
  }
}

function getDefaultQuestions(count: number): Question[] {
  return Array.from({ length: count }, (_, i) => ({
    question: `سؤال تجريبي ${i + 1}`,
    options: [
      "الخيار الأول",
      "الخيار الثاني",
      "الخيار الثالث",
      "الخيار الرابع"
    ],
    correctAnswer: "A"
  }))
}
