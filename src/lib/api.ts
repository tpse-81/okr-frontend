export async function loginUser(username: string, password: string) {
  const response = await fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    body: JSON.stringify({
      "email": username,
      "password": password,
      "two_fa_code": "",
    })
  })

  const response_body = await response.json();
  const token = response_body.jwt_token;
  return token;
}
