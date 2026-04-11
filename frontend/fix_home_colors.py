import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Replace deep red text globally with dark brown text, except for borders if they are intentional.
# Actually, the user asked "el texto sea marron oscuro", so let's target specific text- classes.
content = content.replace('text-[#5e0710]', 'text-[#683110]')
content = content.replace('text-[#ae8d6e]', 'text-[#683110]') # Wait, some are beige. The user said text should be dark brown. I'll change #5e0710 to #683110 for texts.
content = content.replace('text-slate-500', 'text-[#683110]/70')
content = content.replace('text-[#683110]-500', 'text-[#683110]')
content = content.replace('text-purple-900', 'text-[#683110]')
content = content.replace('placeholder-gray-500', 'placeholder-[#683110]/50')
content = content.replace('text-[#f5f4f1]0', 'text-[#f5f4f1]')
content = content.replace('bg-[#f5f4f1]0', 'bg-[#f5f4f1]')

with open('app/page.tsx', 'w') as f:
    f.write(content)
