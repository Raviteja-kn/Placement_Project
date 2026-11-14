@echo off
echo ========================================================
echo Compiling GuestGrid C Console Application...
echo ========================================================

gcc -Wall -Wextra -std=c99 guestgrid.c -o guestgrid.exe
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Compilation complete: guestgrid.exe generated!
    echo Running GuestGrid...
    echo.
    guestgrid.exe
) else (
    echo.
    echo [NOTE] GCC not found on Windows PATH.
    echo You can compile guestgrid.c using:
    echo 1. Code::Blocks: Open guestgrid.c and press F9 (Build and Run)
    echo 2. Dev-C++: Open guestgrid.c and press F11 (Compile and Run)
    echo 3. OnlineGDB / Replit: Paste guestgrid.c and guestgrid.h to run online instantly.
    echo 4. MinGW: gcc guestgrid.c -o guestgrid.exe
)
pause
