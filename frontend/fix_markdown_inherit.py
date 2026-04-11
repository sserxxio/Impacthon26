import re

with open('app/components/MarkdownRenderer.tsx', 'r') as f:
    text = f.read()

# Make the paragraphs and lists inherit the text color from their parent!
text = text.replace('text-[#683110] last:mb-0', 'text-inherit last:mb-0')
text = text.replace('text-[#5e0710] mb-3', 'text-inherit mb-3 opacity-90')
text = text.replace('text-[#683110] ml-4', 'text-inherit ml-4')
text = text.replace('text-[#683110] mb-4 uppercase', 'text-inherit mb-4 uppercase')

with open('app/components/MarkdownRenderer.tsx', 'w') as f:
    f.write(text)
