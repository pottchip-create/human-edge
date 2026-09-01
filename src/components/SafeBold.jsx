// **text** → <strong>text</strong> 를 XSS 없이 렌더링
export default function SafeBold({ text = '' }) {
  const parts = String(text).split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </>
  )
}
