import re

with open('app/components/MarkdownRenderer.tsx', 'r') as f:
    text = f.read()

text = text.replace('prose-invert', '')
text = text.replace('text-[#ae8d6e] mb-6', 'text-[#5e0710] mb-6')
text = text.replace('text-[#f5f4f1] mb-4 uppercase', 'text-[#683110] mb-4 uppercase')
text = text.replace('text-[#f5f4f1] mb-3', 'text-[#5e0710] mb-3')
text = text.replace('text-[#f5f4f1] last:mb-0', 'text-[#683110] last:mb-0')
text = text.replace('text-white shadow-blue-500/10', 'text-[#5e0710]')
text = text.replace('text-[#f5f4f1] ml-4', 'text-[#683110] ml-4')
text = text.replace('text-[#f5f4f1]', 'text-[#683110]')
text = text.replace('bg-[#f5f4f1]0/5', 'bg-[#f5f4f1]')
text = text.replace('text-[#f5f4f1]0', 'text-[#f5f4f1]') # this might overwrite the bg-[#683110]/80 thead text so it becomes text-white on brown bg, which is ok, wait no, text-[#f5f4f1]0 -> text-[#f5f4f1]
# for th and td inside table:
text = text.replace('text-[#683110]0 tracking-widest', 'text-[#f5f4f1] tracking-widest')
text = text.replace('border-[#683110]/50">{children}', 'border-[#683110]/50">{children}')

with open('app/components/MarkdownRenderer.tsx', 'w') as f:
    f.write(text)
