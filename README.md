## Mongosh, generate dummy users for local development
```bash
for (let i = 1; i <= 30; i++) {
  db.users.insertOne({
    name: `User${i}`,
    email: `user${i}@example.com`,
    createdAt: new Date(),
  });
}
```# noobform
<<<<<<< HEAD
=======
# noobform
>>>>>>> a5b0815 (first commit)
# noobform
