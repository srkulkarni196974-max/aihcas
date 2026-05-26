import re

replacements = {
    r'/hb\b/i': r'/\bhb\b/i',
    r'/hgb/i': r'/\bhgb\b/i',
    r'/wbc/i': r'/\bwbc\b/i',
    r'/plt/i': r'/\bplt\b/i',
    r'/ldl/i': r'/\bldl\b/i',
    r'/hdl/i': r'/\bhdl\b/i',
    r'/fbs\b/i': r'/\bfbs\b/i',
    r'/a1c/i': r'/\ba1c\b/i',
    r'/creat\b/i': r'/\bcreat\b/i',
    r'/alt\b/i': r'/\balt\b/i',
    r'/ast\b/i': r'/\bast\b/i',
    r'/rbc/i': r'/\brbc\b/i',
    r'/hct\b/i': r'/\bhct\b/i',
    r'/pcv\b/i': r'/\bpcv\b/i',
    r'/na\b/i': r'/\bna\b/i',
    r'/k\b/i': r'/\bk\b/i',
    r'/cl\b/i': r'/\bcl\b/i',
    r'/egfr/i': r'/\begfr\b/i',
    r'/alp\b/i': r'/\balp\b/i',
    r'/tg\b/i': r'/\btg\b/i',
    r'/ca\b/i': r'/\bca\b/i',
    r'/mg\b/i': r'/\bmg\b/i',
    r'/t3\b/i': r'/\bt3\b/i',
    r'/t4\b/i': r'/\bt4\b/i',
    r'/ft3/i': r'/\bft3\b/i',
    r'/ft4/i': r'/\bft4\b/i',
    r'/ppbs/i': r'/\bppbs\b/i',
    r'/rbs/i': r'/\brbs\b/i',
    r'/neut\b/i': r'/\bneut\b/i',
    r'/lymph\b/i': r'/\blymph\b/i',
    r'/mono\b/i': r'/\bmono\b/i',
    r'/eos\b/i': r'/\beos\b/i',
    r'/baso\b/i': r'/\bbaso\b/i',
    r'/urea\b/i': r'/\burea\b/i',
    r'/vldl/i': r'/\bvldl\b/i',
    r'/ph\b/i': r'/\bph\b/i',
    r'/rbc\/hpf/i': r'/\brbc\/hpf\b/i',
    r'/wbc\/hpf/i': r'/\bwbc\/hpf\b/i',
    r'/rdw/i': r'/\brdw\b/i',
    r'/mpv/i': r'/\bmpv\b/i',
    r'/esr/i': r'/\besr\b/i',
    r'/crp/i': r'/\bcrp\b/i',
    r'/dat\b/i': r'/\bdat\b/i',
    r'/iat\b/i': r'/\biat\b/i',
    r'/hiv/i': r'/\bhiv\b/i',
    r'/tsh/i': r'/\btsh\b/i',
    r'/bun/i': r'/\bbun\b/i'
}

file_path = 'src/lib/report-parser.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for old, new in replacements.items():
    # Avoid double replacing
    if new in content:
        continue
    # Replace exact string occurrences
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f"Replaced {old} with {new}")

if count > 0:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully updated {count} regex definitions in {file_path}")
else:
    print("No regex replacements needed (already up to date).")
