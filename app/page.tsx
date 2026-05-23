
"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { jsPDF } from "jspdf"
import { Upload, Loader2, Download } from "lucide-react"
import { generateQuestions, type Question } from "./actions"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(5)
  const [type, setType] = useState("اختيار متعدد")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"]
    }
  })

  const handleGenerate = async () => {
    if (!file) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("count", String(count))
      formData.append("type", type)

      const result = await generateQuestions(formData)
      setQuestions(result)
    } catch (e) {
      console.error(e)
      alert("صار خطأ أثناء توليد الأسئلة")
    }

    setLoading(false)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("الأسئلة", 100, 20, { align: "center" })

    let y = 40

    questions.forEach((q, i) => {
      doc.text(`${i + 1}- ${q.question}`, 10, y)
      y += 10

      q.options.forEach((o, index) => {
        doc.text(`${String.fromCharCode(65 + index)}) ${o}`, 15, y)
        y += 8
      })

      y += 10
    })

    doc.save("questions.pdf")
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          مولد الأسئلة الذكي
        </h1>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-white/30 rounded-2xl p-10 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3" />
          <p>ارفع PDF أو صورة</p>
        </div>

        {file && (
          <div className="mt-4">
            <p>الملف: {file.name}</p>
          </div>
        )}

        <div className="mt-6 flex gap-4 flex-wrap">
          <div>
            <label>عدد الأسئلة</label>
            <input
              type="number"
              value={count}
              min={1}
              max={20}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-white text-black rounded px-3 py-2 w-28 block"
            />
          </div>

          <div>
            <label>نمط الأسئلة</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white text-black rounded px-3 py-2 block"
            >
              <option>اختيار متعدد</option>
              <option>صح وخطأ</option>
              <option>أسئلة قصيرة</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "توليد الأسئلة"}
        </button>

        {questions.length > 0 && (
          <>
            <div className="mt-10 space-y-6">
              {questions.map((q, i) => (
                <div key={i} className="bg-white/10 p-5 rounded-2xl">
                  <h2 className="font-bold mb-4">
                    {i + 1}. {q.question}
                  </h2>

                  <div className="space-y-2">
                    {q.options.map((o, idx) => (
                      <div key={idx}>
                        {String.fromCharCode(65 + idx)}) {o}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={downloadPDF}
              className="mt-8 bg-green-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <Download />
              تنزيل PDF
            </button>
          </>
        )}
      </div>
    </main>
  )
}
