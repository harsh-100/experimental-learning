import React, { useState } from 'react'

const BACKEND = import.meta.env.VITE_API_BASE ?? ''

export default function App() {
  const [url, setUrl] = useState('')
  const [code, setCode] = useState(null)
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [size, setSize] = useState(300)
  const [format, setFormat] = useState('png')

  async function handleShorten(e) {
    e.preventDefault()
    setError(null)
    if (!url) return setError('Please enter a URL')
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || res.statusText)
      }
      const j = await res.json()
      setCode(j.code)
      setShortUrl(j.shortUrl)
    } catch (err) {
      setError(String(err.message || err))
    } finally {
      setLoading(false)
    }
  }

  function copyShort() {
    if (!shortUrl) return
    navigator.clipboard?.writeText(shortUrl)
  }

  async function downloadImageWithFormat(srcBase, fmt, filenameBase) {
    try {
      // If user chose HPG, we'll fetch PNG from server and convert to WebP client-side
      if (fmt === 'hpg') {
        const fetchUrl = `${srcBase}&format=png`
        const res = await fetch(fetchUrl)
        const blob = await res.blob()
        // convert blob to ImageBitmap
        const imgBitmap = await createImageBitmap(blob)
        const canvas = document.createElement('canvas')
        canvas.width = imgBitmap.width
        canvas.height = imgBitmap.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(imgBitmap, 0, 0)
        // convert to webp blob
        const webpBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp'))
        const urlBlob = URL.createObjectURL(webpBlob)
        const a = document.createElement('a')
        a.href = urlBlob
        a.download = `${filenameBase}.hpg`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(urlBlob)
        return
      }

      // For png/jpeg request the backend with the requested format
      const fetchUrl = `${srcBase}&format=${encodeURIComponent(fmt)}`
      const res = await fetch(fetchUrl)
      const blob = await res.blob()
      const ext = fmt === 'jpeg' ? 'jpg' : 'png'
      const urlBlob = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = urlBlob
      a.download = `${filenameBase}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(urlBlob)
    } catch (err) {
      console.error('download error', err)
      setError('Failed to download image')
    }
  }

  const originalQrSrc = url ? `${BACKEND}/api/qr?url=${encodeURIComponent(url)}&size=${size}` : null
  const shortQrSrc = code ? `${BACKEND}/api/qr/code/${encodeURIComponent(code)}?size=${size}` : null


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Follow badge */}
        <div className="fixed left-1/2 bottom-6 z-50 -translate-x-1/2 md:right-4 md:left-auto md:top-4 md:bottom-auto md:translate-x-0 flex flex-col items-center md:items-end gap-3">
          {/* Visit Harshagarwal.dev — subtle slate gradient */}
         

          {/* Follow Harsh on GitHub — distinct purple/pink gradient */}
          <a
            href="https://harshagarwal.dev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Harsh on GitHub"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 transition-transform"
          >
           <span className="text-lg">🎁</span>
            <span className="font-semibold">Visit Harshagarwal.dev</span>
          </a>

            <a
            href="https://github.com/harsh-100/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Harsh on GitHub"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.335-5.467-5.934 0-1.31.468-2.38 1.236-3.22-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.399 3-.405 1.02.006 2.043.139 3 .405 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.243 2.874.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.814 1.103.814 2.222 0 1.606-.015 2.902-.015 3.297 0 .32.215.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-sm font-semibold">Follow Harsh</span>
          </a>
        </div>
  <div className="max-w-2xl w-full mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Link Short + QR Maker</h1>

        <form onSubmit={handleShorten} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input
              className="mt-1 block w-full border rounded px-3 py-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/long/path"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Working...' : 'Shorten'}
            </button>

            <div className="mt-3 sm:mt-0 sm:ml-3 flex items-center gap-3">
              <div className="text-sm text-gray-600">Size: {size}px</div>
              <input
                type="range"
                min="100"
                max="800"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>

            <div className="mt-3 sm:mt-0 sm:ml-3">
              <label className="block text-sm text-gray-600">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-1 border rounded px-2 py-1">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="hpg">HPG (webp-based)</option>
              </select>
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          {shortUrl && (
            <div className="mt-3 p-3 border rounded bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate">Short URL: <a className="text-blue-600" href={shortUrl}>{shortUrl}</a></div>
                <div className="flex gap-2">
                  <button onClick={copyShort} className="px-3 py-1 bg-gray-200 rounded">Copy</button>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <h3 className="font-medium">Originaldd URL QR</h3>
            {originalQrSrc ? (
              <>
                <div style={{ width: '100%', maxWidth: size }} className="mx-auto my-3">
                  <img src={`${originalQrSrc}&format=png`} alt="Original QR" style={{ width: '100%', height: 'auto' }} />
                </div>
                <div className="flex justify-center gap-2">
                  <button className="w-full sm:w-auto px-3 py-1 bg-gray-200 rounded" onClick={() => downloadImageWithFormat(originalQrSrc, format, 'original-qr')}>Download {format.toUpperCase()}</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Enter a URL to generate the original QR</div>
            )}
          </div>

          <div className="text-center">
            <h3 className="font-medium">Short URL QR</h3>
            {shortQrSrc ? (
              <>
                <div style={{ width: '100%', maxWidth: size }} className="mx-auto my-3">
                  <img src={`${shortQrSrc}&format=png`} alt="Short QR" style={{ width: '100%', height: 'auto' }} />
                </div>
                <div className="flex justify-center gap-2">
                  <button className="w-full sm:w-auto px-3 py-1 bg-gray-200 rounded" onClick={() => downloadImageWithFormat(shortQrSrc, format, 'short-qr')}>Download {format.toUpperCase()}</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Shorten a URL to generate the short-URL QR</div>
            )}
          </div>
        </div>
      </div>
      {/* Birthday-style visit button at bottom center */}
    </div>
  )
}
