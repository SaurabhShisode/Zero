import React from "react"

interface LoaderProps {
  text?: string
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-black text-white">
      
     
      <div className="flex space-x-2">
        <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-3 h-3 bg-white/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-3 h-3 bg-white/40 rounded-full animate-bounce" />
      </div>

      {text && (
        <p className="mt-6 font-geist text-sm tracking-wide text-white/60">
          {text}
        </p>
      )}
    </div>
  )
}

export default Loader
