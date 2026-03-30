const BASE = "/api"

const getToken = () => localStorage.getItem("mm_token")

function isAuthEndpoint(url) {
  return url === BASE + "/auth/login" || url === BASE + "/auth/register"
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return await res.json()
  }

  const text = await res.text()
  return { message: text || "Unexpected server response" }
}

async function request(url, method, body) {
  const token = getToken()

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    }
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(url, options)
  const data = await parseResponse(res)

  if (res.status === 401) {
    const shouldAutoLogout = Boolean(token) && !isAuthEndpoint(url)

    if (shouldAutoLogout) {
      localStorage.removeItem("mm_token")
      localStorage.removeItem("mm_user")
      window.location.href = "/auth"
      return
    }

    throw new Error(data?.message || data?.error || "Invalid email or password")
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Something went wrong")
  }

  return data
}

export const loginUser = (email, password) =>
  request(BASE + "/auth/login", "POST", { email, password })

export const registerUser = (name, email, password) =>
  request(BASE + "/auth/register", "POST", { name, email, password })

export const getMe = () =>
  request(BASE + "/auth/me", "GET")

export const createSession = (jobRole) =>
  request(BASE + "/interview/create", "POST", { jobRole })

export const getSession = (sessionId) =>
  request(BASE + "/interview/session/" + sessionId, "GET")

export const generateQuestion = (sessionId) =>
  request(BASE + "/interview/generate-question", "POST", { sessionId })

export const submitAnswer = (sessionId, answer) =>
  request(BASE + "/interview/submit-answer", "POST", { sessionId, answer })

export const continueInterview = (sessionId) =>
  request(BASE + "/interview/continue-interview", "POST", { sessionId })

export const reviewCode = (sessionId, code, language) =>
  request(BASE + "/code/review", "POST", { sessionId, code, language })

export const getReport = (sessionId) =>
  request(BASE + "/interview/report/" + sessionId, "GET")