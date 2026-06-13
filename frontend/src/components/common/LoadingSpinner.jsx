import './LoadingSpinner.css'

export default function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  )
}
