@echo off
set NODE_PATH="C:\Users\Salu\AppData\Local\ms-playwright-go\1.57.0\node.exe"

if "%1"=="dev" (
    echo Starting development server...
    %NODE_PATH% node_modules/next/dist/bin/next dev %2 %3 %4
) else if "%1"=="build" (
    echo Generating Prisma client...
    %NODE_PATH% node_modules/prisma/build/index.js generate
    echo Building Next.js app...
    %NODE_PATH% node_modules/next/dist/bin/next build
) else if "%1"=="prisma" (
    %NODE_PATH% node_modules/prisma/build/index.js %2 %3 %4 %5 %6 %7 %8 %9
) else if "%1"=="seed" (
    echo Seeding database...
    %NODE_PATH% node_modules/tsx/dist/cli.mjs prisma/seed.ts
) else (
    echo Usage:
    echo   run dev      - Starts the development server
    echo   run build    - Generates client and builds the application
    echo   run prisma   - Runs prisma CLI commands (e.g., run prisma studio)
    echo   run seed     - Seeds the database
)
