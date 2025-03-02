## Setup & Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (if not already) with your MySQL credentials:
   ```
   SQL_HOST=SQL_HOST
   SQL_NAME=SQL_NAME
   SQL_PASSWORD=SQL_PASSWORD
   SQL_DATABASE=SQL_DATABASE
   ```

3. Initialize the database schema:
   ```bash
   npm run db:init
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Access the app at [http://localhost:3000](http://localhost:3000).
