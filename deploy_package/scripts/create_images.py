#!/usr/bin/env python3
"""
Create Default Icons for Discord Rich Presence
===============================================
Generates default 512x512 PNG images for Discord Rich Presence
if custom images are not available.

Required: pip install pillow
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("❌ Pillow not installed. Run: pip install pillow")

# Color schemes
COLORS = {
    'logo': {
        'bg': (0, 240, 255),      # Cyan
        'fg': (3, 3, 5),          # Dark
        'accent': (57, 255, 20)   # Neon green
    },
    'working': {
        'bg': (57, 255, 20),      # Neon green
        'fg': (3, 3, 5),
        'accent': (0, 240, 255)
    },
    'idle': {
        'bg': (250, 204, 21),     # Yellow
        'fg': (3, 3, 5),
        'accent': (255, 255, 255)
    },
    'listening': {
        'bg': (0, 240, 255),
        'fg': (3, 3, 5),
        'accent': (255, 255, 255)
    },
    'speaking': {
        'bg': (57, 255, 20),
        'fg': (3, 3, 5),
        'accent': (0, 240, 255)
    },
    'python': {
        'bg': (55, 118, 171),     # Python blue
        'fg': (255, 212, 59),     # Python yellow
        'accent': (255, 255, 255)
    },
    'online': {
        'bg': (57, 255, 20),
        'fg': (255, 255, 255),
        'accent': (3, 3, 5)
    },
    'away': {
        'bg': (250, 204, 21),
        'fg': (3, 3, 5),
        'accent': (255, 255, 255)
    },
    'busy': {
        'bg': (255, 0, 60),
        'fg': (255, 255, 255),
        'accent': (3, 3, 5)
    }
}

# Symbols for each icon
SYMBOLS = {
    'logo': '🎤',
    'working': '⚡',
    'idle': '💤',
    'listening': '🎧',
    'speaking': '🔊',
    'python': '🐍',
    'online': '●',
    'away': '◐',
    'busy': '⛔'
}


def create_icon(name: str, size: int = 512, output_dir: str = 'images') -> str:
    """Create a single icon"""
    if not PIL_AVAILABLE:
        return None
    
    colors = COLORS.get(name, COLORS['logo'])
    symbol = SYMBOLS.get(name, '●')
    
    # Create image with background
    img = Image.new('RGBA', (size, size), colors['bg'])
    draw = ImageDraw.Draw(img)
    
    # Add gradient-like effect (darker at edges)
    for i in range(size // 4):
        alpha = int(255 * (1 - i / (size // 4)) * 0.3)
        edge_color = (*colors['bg'][:3], alpha)
        draw.rectangle([i, i, size - i, size - i], outline=edge_color)
    
    # Draw center circle
    center = size // 2
    radius = size // 3
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill=colors['fg'],
        outline=colors['accent'],
        width=4
    )
    
    # Draw symbol/text in center
    try:
        # Try to use a system font
        font_size = size // 4
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
            except:
                font = ImageFont.load_default()
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), symbol, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Draw text centered
        text_x = center - text_width // 2
        text_y = center - text_height // 2 - 10
        draw.text((text_x, text_y), symbol, fill=colors['accent'], font=font)
        
    except Exception as e:
        print(f"Warning: Could not render symbol for {name}: {e}")
    
    # Draw name text at bottom
    try:
        name_font_size = size // 10
        try:
            name_font = ImageFont.truetype("arial.ttf", name_font_size)
        except:
            try:
                name_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", name_font_size)
            except:
                name_font = ImageFont.load_default()
        
        name_text = name.upper()
        bbox = draw.textbbox((0, 0), name_text, font=name_font)
        text_width = bbox[2] - bbox[0]
        
        text_x = center - text_width // 2
        text_y = size - size // 6
        draw.text((text_x, text_y), name_text, fill=colors['fg'], font=name_font)
        
    except Exception as e:
        print(f"Warning: Could not render name for {name}: {e}")
    
    # Add corner accents
    accent_size = size // 10
    # Top-left
    draw.line([(0, accent_size), (0, 0), (accent_size, 0)], fill=colors['accent'], width=3)
    # Top-right
    draw.line([(size - accent_size, 0), (size, 0), (size, accent_size)], fill=colors['accent'], width=3)
    # Bottom-left
    draw.line([(0, size - accent_size), (0, size), (accent_size, size)], fill=colors['accent'], width=3)
    # Bottom-right
    draw.line([(size - accent_size, size), (size, size), (size, size - accent_size)], fill=colors['accent'], width=3)
    
    # Save image
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    filepath = output_path / f"{name}.png"
    img.save(filepath, 'PNG')
    print(f"✅ Created: {filepath}")
    
    return str(filepath)


def create_all_icons(output_dir: str = 'images', size: int = 512):
    """Create all default icons"""
    if not PIL_AVAILABLE:
        print("❌ Cannot create icons - Pillow not installed")
        print("   Run: pip install pillow")
        return []
    
    print(f"\n📁 Creating icons in: {output_dir}/")
    print("=" * 40)
    
    created = []
    for name in COLORS.keys():
        path = create_icon(name, size, output_dir)
        if path:
            created.append(path)
    
    print("=" * 40)
    print(f"✅ Created {len(created)} icons")
    print("\n📋 Upload these images to Discord:")
    print("   1. Go to https://discord.com/developers/applications")
    print("   2. Select your application")
    print("   3. Go to 'Rich Presence' -> 'Art Assets'")
    print("   4. Upload each PNG file")
    print("   5. Use the filename (without .png) as the image key")
    
    return created


def main():
    """Main entry point"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🎨 Discord Rich Presence Icon Generator                 ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    import argparse
    parser = argparse.ArgumentParser(description='Create Discord Rich Presence icons')
    parser.add_argument('-o', '--output', default='images', help='Output directory')
    parser.add_argument('-s', '--size', type=int, default=512, help='Image size (default: 512)')
    parser.add_argument('-n', '--name', help='Create single icon by name')
    
    args = parser.parse_args()
    
    if args.name:
        if args.name in COLORS:
            create_icon(args.name, args.size, args.output)
        else:
            print(f"❌ Unknown icon name: {args.name}")
            print(f"   Available: {', '.join(COLORS.keys())}")
    else:
        create_all_icons(args.output, args.size)


if __name__ == "__main__":
    main()
