```bash
# 1. Local Development:
   # Copy .env.example to .env in each service
   # Start MongoDB with authentication

mongod --auth

rabb
```
```bash
# Create root user in MongoDB:

mongosh
use admin
db.createUser({
  user: "root",
  pwd: "test@123",
  roles: [ "root" ]
})

```