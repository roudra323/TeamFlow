# TeamFlow Backend

## Starting the PostgreSQL Server
```bash
pg_ctl -D "C:\Program Files\PostgreSQL\17\data" -o "-p 5001" start
```
# Start Node server
```bash
npm run dev
```

# Stop the PostgreSQL server
```bash
pg_ctl -D "C:\Program Files\PostgreSQL\17\data" stop
```