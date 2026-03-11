#!/usr/bin/env python3
"""
Build Voice Assistant to Executable
====================================
Uses PyInstaller to create a standalone executable
with minimal file size using UPX compression.

Run: python build_exe.py
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path


def check_dependencies():
    """Check if required build tools are installed"""
    print("🔍 Checking dependencies...")
    
    # Check PyInstaller
    try:
        import PyInstaller
        print(f"  ✅ PyInstaller {PyInstaller.__version__}")
    except ImportError:
        print("  ❌ PyInstaller not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)
        print("  ✅ PyInstaller installed")
    
    # Check for UPX
    upx_path = shutil.which("upx")
    if upx_path:
        print(f"  ✅ UPX found at {upx_path}")
        return upx_path
    else:
        print("  ⚠️  UPX not found (optional - for compression)")
        print("     Download from: https://github.com/upx/upx/releases")
        return None


def build_executable(upx_path=None):
    """Build the executable using PyInstaller"""
    print("\n🔨 Building executable...")
    
    # PyInstaller options
    options = [
        "voice_assistant_rich.py",
        "--name=CRY-NO-AI-VoiceAssistant",
        "--onefile",
        "--console",  # Keep console for logging
        "--clean",
        "--noconfirm",
        # Include data files
        "--add-data=config.json;.",
    ]
    
    # Add icon if exists
    icon_path = Path("images/logo.png")
    if icon_path.exists():
        # Convert PNG to ICO for Windows
        try:
            from PIL import Image
            ico_path = Path("icon.ico")
            img = Image.open(icon_path)
            img.save(ico_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
            options.append(f"--icon={ico_path}")
            print(f"  ✅ Using icon: {ico_path}")
        except Exception as e:
            print(f"  ⚠️  Could not create icon: {e}")
    
    # Add UPX if available
    if upx_path:
        options.append(f"--upx-dir={os.path.dirname(upx_path)}")
        print(f"  ✅ Using UPX compression")
    
    # Hidden imports
    hidden_imports = [
        "pypresence",
        "websockets",
        "aiohttp",
        "asyncio",
        "json",
        "logging",
    ]
    for imp in hidden_imports:
        options.append(f"--hidden-import={imp}")
    
    # Excludes to reduce size
    excludes = [
        "matplotlib",
        "numpy",
        "pandas",
        "scipy",
        "tkinter",
        "PyQt5",
        "PyQt6",
        "PySide2",
        "PySide6",
        "wx",
        "IPython",
        "notebook",
        "sphinx",
        "pytest",
    ]
    for exc in excludes:
        options.append(f"--exclude-module={exc}")
    
    # Run PyInstaller
    print(f"\n  Running: pyinstaller {' '.join(options)}")
    print("-" * 60)
    
    result = subprocess.run(
        [sys.executable, "-m", "PyInstaller"] + options,
        capture_output=False
    )
    
    if result.returncode != 0:
        print("\n❌ Build failed!")
        return False
    
    return True


def post_build():
    """Post-build cleanup and info"""
    print("\n" + "=" * 60)
    
    dist_path = Path("dist")
    exe_path = dist_path / "CRY-NO-AI-VoiceAssistant.exe"
    
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"✅ Build successful!")
        print(f"📦 Executable: {exe_path}")
        print(f"📊 Size: {size_mb:.2f} MB")
        
        # Copy config to dist
        config_src = Path("config.json")
        if config_src.exists():
            shutil.copy(config_src, dist_path / "config.json")
            print(f"📄 Copied: config.json")
        
        # Copy images folder if exists
        images_src = Path("images")
        images_dst = dist_path / "images"
        if images_src.exists():
            if images_dst.exists():
                shutil.rmtree(images_dst)
            shutil.copytree(images_src, images_dst)
            print(f"📁 Copied: images/")
        
        print("\n" + "=" * 60)
        print("📋 Distribution files in 'dist' folder:")
        for f in dist_path.iterdir():
            print(f"   - {f.name}")
        print("=" * 60)
        
        return True
    else:
        print("❌ Executable not found!")
        return False


def cleanup():
    """Clean up build artifacts"""
    print("\n🧹 Cleaning up build artifacts...")
    
    # Remove build folder
    build_path = Path("build")
    if build_path.exists():
        shutil.rmtree(build_path)
        print("  ✅ Removed: build/")
    
    # Remove spec file
    spec_file = Path("CRY-NO-AI-VoiceAssistant.spec")
    if spec_file.exists():
        spec_file.unlink()
        print("  ✅ Removed: .spec file")


def main():
    """Main entry point"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🔨 CRY-NO-AI Voice Assistant - Build Script             ║
    ║   Creating Standalone Executable                          ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Check if main script exists
    if not Path("voice_assistant_rich.py").exists():
        print("❌ voice_assistant_rich.py not found!")
        print("   Please run this script from the scripts directory.")
        sys.exit(1)
    
    # Check dependencies
    upx_path = check_dependencies()
    
    # Build
    if build_executable(upx_path):
        # Post-build
        if post_build():
            # Cleanup
            cleanup()
            print("\n✅ Build complete! Check the 'dist' folder.")
        else:
            print("\n⚠️  Build completed with warnings.")
    else:
        print("\n❌ Build failed. Check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
