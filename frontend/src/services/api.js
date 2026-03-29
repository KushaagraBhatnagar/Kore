const BASE = '/api'

const getToken = () => localStorage.getItem('mm_token')

async function request(url, method, body) {
  const token = getToken()
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
     },
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  const res = await fetch(url, options)
  const data = await res.json()

  if(res.status === 401){
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    window.location.href = '/auth'
    return
  }

  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}


export const loginUser      = (email, password)       => request(BASE + '/auth/login',    'POST', { email, password })
export const registerUser   = (name, email, password) => request(BASE + '/auth/register', 'POST', { name, email, password })
export const getMe         = ()                      => request(BASE + '/auth/me',       'GET')
export const createSession  = (jobRole)                    => request(BASE + '/interview/create',            'POST', { jobRole })
export const getSession     = (sessionId)                  => request(BASE + '/interview/session/' + sessionId, 'GET')
export const generateQuestion = (sessionId)                => request(BASE + '/interview/generate-question', 'POST', { sessionId })
export const submitAnswer   = (sessionId, answer)          => request(BASE + '/interview/submit-answer',     'POST', { sessionId, answer })
export const continueInterview = (sessionId)               => request(BASE + '/interview/continue-interview','POST', { sessionId })
export const reviewCode     = (sessionId, code, language)  => request(BASE + '/code/review',                 'POST', { sessionId, code, language })
export const getReport      = (sessionId)                  => request(BASE + '/interview/report/' + sessionId, 'GET')