# Database Setup for Render

You are currently seeing an error like `connect ECONNREFUSED 127.0.0.1:3306` in your Render logs.
This happens because your Render application is trying to connect to a "localhost" database, but there is no database running inside the Render web service container.

You must host your MySQL database separately and provide the credentials to Render.

## Step 1: Create a Cloud Database
You need a MySQL database accessible from the internet.
**Options:**
1.  **Aiven** (Free tier available): [https://aiven.io/](https://aiven.io/)
2.  **Clever Cloud** (Free tier available): [https://www.clever-cloud.com/](https://www.clever-cloud.com/)
3.  **PlanetScale** (Paid, but good).
4.  **Render PostgreSQL** (Render has native PostgreSQL support, but your code is written for MySQL (`mysql2` package), so you should stick to MySQL providers unless you want to rewrite your backend).

## Step 2: Get your Credentials
Once created, you will get:
- **Host** (e.g., `mysql-service-account.aivencloud.com`)
- **Port** (e.g., `21698`)
- **User** (e.g., `avnadmin`)
- **Password**
- **Database Name** (e.g., `defaultdb`)

## Step 3: Add Environment Variables in Render
1.  Go to your Render Dashboard -> Select your Web Service.
2.  Click **Environment**.
3.  Add the following variables:

| Key | Value (Example) |
|-----|----------------|
| `DB_HOST` | `mysql-service...cloud.com` |
| `DB_PORT` | `21698` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | `your-secure-password` |
| `DB_NAME` | `defaultdb` |

## Step 4: Import your Data
You likely have tables (`users`, `clients`, etc.) on your local computer. You need to recreate these on your cloud database.
1.  Export your local database to a `.sql` file using Workbench or `mysqldump`.
2.  Connect to your **Cloud Database** using a tool like **MySQL Workbench** or **DBeaver** using the credentials from Step 2.
3.  Run the SQL script to create the tables.

Once you add these variables, Render will automatically restart your app, and it should connect successfully!
