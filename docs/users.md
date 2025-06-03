## User Api Spec

Ketentuan:

- Username harus unik.
- Authentication menggunakan JWT token.
- JWT token harus mengandung payload berisi userId yang merupakan id dari user autentik.
- Nilai secret key token JWT baik access token ataupun refresh token wajib menggunakan environment variable ACCESS_TOKEN_KEY dan REFRESH_TOKEN_KEY.
- Refresh token memiliki signature yang benar serta terdaftar di database.

### Create User

Description: Add new User

- Endpoint : POST /users

Request Header :

- Content-Type : "application/json"

Request Body :

```
{
  "username": "test123", //string
  "password": "secretpassword", //string bcrypt
  "fullname: "Name Test" // string
}
```

Response Body (201 CREATED) :

```
{
  "status": "success",
  "data": {
    "userId": "user_id"
  }
}
```

Response Body (400 BAD REQUEST) :

```
{
  "status": "fail",
  "message": "error message payload validation"
}
```

Response Body (500 INTERNAL SERVER ERROR) :

```
{
  "status": "fail",
  "message": "error message internal error server"
}
```