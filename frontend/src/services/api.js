const BASE = 'http://localhost:8000/api'

async function request(url, method, body) {
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  const res = await fetch(url, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const createSession  = (jobRole)                    => request(BASE + '/interview/create',            'POST', { jobRole })
export const getSession     = (sessionId)                  => request(BASE + '/interview/session/' + sessionId, 'GET')
export const generateQuestion = (sessionId)                => request(BASE + '/interview/generate-question', 'POST', { sessionId })
export const submitAnswer   = (sessionId, answer)          => request(BASE + '/interview/submit-answer',     'POST', { sessionId, answer })
export const continueInterview = (sessionId)               => request(BASE + '/interview/continue-interview','POST', { sessionId })
export const reviewCode     = (sessionId, code, language)  => request(BASE + '/code/review',                 'POST', { sessionId, code, language })
export const getReport      = (sessionId)                  => request(BASE + '/interview/report/' + sessionId, 'GET')