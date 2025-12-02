import { NextRequest, NextResponse } from "next/server"

// Proxy Ollama API requests from the browser
// This handles the /api/ollama/* routes

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const ollamaPath = path.join("/")
  const url = `${OLLAMA_BASE_URL}/${ollamaPath}`

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Ollama API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Ollama proxy error:", error)
    return NextResponse.json(
      { error: "Failed to connect to Ollama. Is the service running?" },
      { status: 503 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const ollamaPath = path.join("/")
  const url = `${OLLAMA_BASE_URL}/${ollamaPath}`

  try {
    const body = await request.json()
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Ollama API error: ${errorText}` },
        { status: response.status }
      )
    }

    // Check if it's a streaming response
    const contentType = response.headers.get("content-type")
    if (body.stream !== false && response.body) {
      // Stream the response back
      return new Response(response.body, {
        headers: {
          "Content-Type": contentType || "application/x-ndjson",
          "Transfer-Encoding": "chunked",
        },
      })
    }

    // Non-streaming response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Ollama proxy error:", error)
    return NextResponse.json(
      { error: "Failed to connect to Ollama. Is the service running?" },
      { status: 503 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const ollamaPath = path.join("/")
  const url = `${OLLAMA_BASE_URL}/${ollamaPath}`

  try {
    const body = await request.json()
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Ollama API error: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Ollama proxy error:", error)
    return NextResponse.json(
      { error: "Failed to connect to Ollama. Is the service running?" },
      { status: 503 }
    )
  }
}
