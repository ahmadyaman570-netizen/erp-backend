# Professional ERP Backend hi
s
Backend API for an Arabic ERP system built with Node.js, Express, Sequelize and MySQL.

## Main modules
- Authentication and permissions
- Customers and suppliers
- Categories and products
- Warehouses and inventory balances per product/warehouse
- Inventory transactions: IN, OUT, ADJUSTMENT
- Purchase invoices with automatic stock increase and journal entry
- Sales invoices with automatic stock decrease, revenue and COGS entries
- Chart of accounts, journal entries, trial balance and general ledger
- Receipt and payment vouchers
- Dashboard summary API

## Run
```bash
npm install
npm run dev
```

Create `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=erp_db
JWT_SECRET=change_me
```

## Important concept
The product table does not store stock quantity directly. Stock is calculated from the `inventory` table by `productId + warehouseId`. This is the correct ERP design because one product can exist in many warehouses with different quantities.
