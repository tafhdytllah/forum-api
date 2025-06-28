## Threads API Spec

### Create Thread

Ketentuan:

- Menambahkan thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang membuat thread.
- Jika properti body request tidak lengkap atau tidak sesuai Kembalikan dengan status code 400, serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
  
Description : Add new thread

- Endpoint : POST /threads

Request Header :

- Content-Type : "application/json"
- Authorization : "Bearer (token)"

Request Body :

```
{
  "title": "Life", //string
  "body": "Life in Technicolor", //string
}
```

Response Body (201 CREATED) :

```
{
  "status": "success",
  "data": {
    "addedThread": {
      "id": "thread-h_W1Plfpj0TY7wyT2PUPX",
      "title": "sebuah thread",
      "owner": "user-DWrT3pXe1hccYkV1eIAxS"
    }
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

### Get Thread

Ketentuan:

- Mendapatkan detail thread merupakan resource terbuka. Sehingga tidak perlu melampirkan access token.
- Jika thread yang diakses tidak ada atau tidak valid, maka: Kembalikan dengan status code 404; serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
- Wajib menampilkan seluruh komentar yang terdapat pada thread tersebut sesuai dengan contoh di atas.
- Komentar yang dihapus ditampilkan dengan konten **komentar telah dihapus**.
- Komentar diurutkan secara ascending (dari kecil ke besar) berdasarkan waktu berkomentar.

Description: Find thread by id

- Endpoint : GET /threads/{threadId}

Request Header :

- Content-Type : "application/json"

Response Body (200 OK) :

```
{
  "status": "success",
  "data": {
    "thread": {
      "id": "thread-h_2FkLZhtgBKY2kh4CC02",
      "title": "sebuah thread",
      "body": "sebuah body thread",
      "date": "2021-08-08T07:19:09.775Z",
      "username": "dicoding",
      "comments": [
        {
          "id": "comment-_pby2_tmXV6bcvcdev8xk",
          "username": "johndoe",
          "date": "2021-08-08T07:22:33.555Z",
          "content": "sebuah comment"
        },
        {
          "id": "comment-yksuCoxM2s4MMrZJO-qVD",
          "username": "dicoding",
          "date": "2021-08-08T07:26:21.338Z",
          "content": "**komentar telah dihapus**"
        }
      ]
    }
  }
}

```

### Create Comment to Thread

Ketentuan:

- Menambahkan komentar pada thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang membuat komentar.
- Jika thread yang diberi komentar tidak ada atau tidak valid, maka: Kembalikan dengan status code 404, serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
- Jika properti body request tidak lengkap atau tidak sesuai, maka: Kembalikan dengan status code 400, serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.


Description: Add comment to thread

- Endpoint : POST /threads/{threadId}/comments

Request Header :

- Content-Type : "application/json"
- Authorization : "Bearer (token)"

Request Body :

```
{
  "content": "sebuah comment", //string
}
```

Response Body (201 CREATED) :

```
{
  "status": "success",
  "data": {
    "addedComment": {
      "id": "comment-_pby2_tmXV6bcvcdev8xk",
      "title": "sebuah comment",
      "owner": "user-CrkY5iAgOdMqv36bIvys2"
    }
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

Response Body (404 NOT FOUND) :

```
{
  "status": "fail",
  "message": "error message resource not found"
}
```

### Delete Comment From Thread

Ketentuan:

- Menghapus komentar pada thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang menghapus komentar.
- Komentar dihapus secara soft delete, alias tidak benar-benar dihapus dari database. Anda bisa membuat dan memanfaatkan kolom seperti is_delete sebagai indikator apakah komentar dihapus atau tidak.
- Hanya pemilik komentar yang dapat menghapus komentar. Bila bukan pemilik komentar, maka: Kembalikan dengan status code 403; serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
- Jika thread atau komentar yang hendak dihapus tidak ada atau tidak valid, maka: Kembalikan dengan status code 404; serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong

Description: Remove comment from thread

- Endpoint : DELETE /threads/{threadId}/comments/{commentId}

Request Header :

- Content-Type : "application/json"
- Authorization : "Bearer (token)"

Response Body (200 OK) :

```
{
  "status": "success",
}
```

Response Body (403 FORBIDDEN) :

```
{
  "status": "fail",
  "message": "error message payload validation"
}
```

Response Body (404 NOT FOUND) :

```
{
  "status": "fail",
  "message": "error message payload validation"
}
```

### Create Reply to Thread Comments

Ketentuan:

- Menambahkan balasan pada komentar thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang membuat balasan komentar.
- Jika thread atau komentar yang diberi balasan tidak ada atau tidak valid, maka: Kembalikan dengan status code 404; serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
- Jika properti body request tidak lengkap atau tidak sesuai, maka: Kembalikan dengan status code 400; serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
- Balasan pada komentar thread harus ditampilkan pada setiap item comments ketika mengakses detail thread.
```
{
  "status": "success",
  "data": {
    "thread": {
      "id": "thread-AqVg2b9JyQXR6wSQ2TmH4",
      "title": "sebuah thread",
      "body": "sebuah body thread",
      "date": "2021-08-08T07:59:16.198Z",
      "username": "dicoding",
      "comments": [
        {
          "id": "comment-q_0uToswNf6i24RDYZJI3",
          "username": "dicoding",
          "date": "2021-08-08T07:59:18.982Z",
          "replies": [
            {
              "id": "reply-BErOXUSefjwWGW1Z10Ihk",
              "content": "**balasan telah dihapus**",
              "date": "2021-08-08T07:59:48.766Z",
              "username": "johndoe"
            },
            {
              "id": "reply-xNBtm9HPR-492AeiimpfN",
              "content": "sebuah balasan",
              "date": "2021-08-08T08:07:01.522Z",
              "username": "dicoding"
            }
          ],
          "content": "sebuah comment"
        }
      ]
    }
  }
}
```
- Balasan yang dihapus ditampilkan dengan konten **balasan telah dihapus**.
- Balasan diurutkan secara ascending (dari kecil ke besar) berdasarkan waktu berkomentar.

Description: Add reply to comment thread

- Endpoint : POST /threads/{threadId}/comments

Request Header :

- Content-Type : "application/json"
- Authorization : "Bearer (token)"
  
Request Body :

```
{
  "content": "sebuah balasan comment", //string
}
```

Response Body (201 CREATED) :

```
{
  "status": "success",
  "data": {
    "addedReply": {
      "id": "reply-BErOXUSefjwWGW1Z10Ihk",
      "content": "sebuah balasan comment",
      "owner": "user-CrkY5iAgOdMqv36bIvys2"
    }
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

Response Body (404 NOT FOUND) :

```
{
  "status": "fail",
  "message": "error message resource not found"
}
```

### Delete Replies to Thread Comments

Ketentuan:

- Menghapus balasan pada komentar thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang menghapus balasan.
- Hanya pemilik balasan yang dapat menghapus balasan. Bila bukan pemilik balasan, maka: Kembalikan dengan status code 403; serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
- Jika thread, komentar, atau balasan yang hendak dihapus tidak ada atau tidak valid, maka: Kembalikan dengan status code 404; serta Berikan body response: status: “fail” message: Pesan apapun selama tidak kosong.
Balasan dihapus secara soft delete, alias tidak benar-benar dihapus dari database. Anda bisa membuat dan memanfaatkan kolom seperti is_delete sebagai indikator apakah komentar dihapus atau tidak.

Description: Remove Replies to Thread Comments

- Endpoint : DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}

Request Header :

- Content-Type : "application/json"
- Authorization : "Bearer (token)"

Response Body (200 OK) :

```
{
  "status": "success",
}
```

Response Body (403 FORBIDDEN) :

```
{
  "status": "fail",
  "message": "error message payload validation"
}
```

Response Body (404 NOT FOUND) :

```
{
  "status": "fail",
  "message": "error message payload validation"
}
```