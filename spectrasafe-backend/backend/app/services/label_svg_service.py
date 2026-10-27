"""
Renders a Label's data as a clean, complete SVG layout -- vector output,
crisp at any size, deterministic template fill (no image generation).
This is an information-complete label design, NOT a certified
reproduction of any single country's official panel typography spec --
see label_rules/ for what's actually verified about each country's
numeric requirements.
"""
from xml.sax.saxutils import escape


def _esc(value) -> str:
    return escape(str(value)) if value is not None else ""


def render_label_svg(data: dict) -> str:
    width, height = 600, 800
    y = 40
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'font-family="Helvetica, Arial, sans-serif">',
        f'<rect width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="2"/>',
    ]

    def text(x, yy, content, size=14, weight="normal", fill="#111"):
        return f'<text x="{x}" y="{yy}" font-size="{size}" font-weight="{weight}" fill="{fill}">{_esc(content)}</text>'

    product_name = data.get("product_name", "")
    parts.append(text(30, y, product_name, size=26, weight="bold"))
    y += 30
    if data.get("brand_name"):
        parts.append(text(30, y, data["brand_name"], size=14, fill="#555"))
        y += 30

    parts.append(f'<line x1="30" y1="{y}" x2="{width-30}" y2="{y}" stroke="#ccc"/>')
    y += 30

    if data.get("ingredients_list"):
        parts.append(text(30, y, "INGREDIENTS", size=11, weight="bold", fill="#666"))
        y += 20
        # naive word-wrap at ~70 chars/line for the SVG text element
        words = data["ingredients_list"].split()
        line, lines = "", []
        for w in words:
            if len(line) + len(w) > 70:
                lines.append(line)
                line = w
            else:
                line = f"{line} {w}".strip()
        if line:
            lines.append(line)
        for line in lines[:6]:
            parts.append(text(30, y, line, size=12))
            y += 16
        y += 15

    if data.get("allergens"):
        parts.append(text(30, y, f"Contains: {', '.join(data['allergens'])}", size=12, weight="bold", fill="#a32d2d"))
        y += 30

    nutrients = data.get("nutrients", {})
    if nutrients:
        parts.append(f'<rect x="30" y="{y}" width="{width-60}" height="{30 + 22*len(nutrients)}" fill="none" stroke="#333" stroke-width="1.5"/>')
        y += 22
        parts.append(text(40, y, "NUTRITION FACTS", size=16, weight="bold"))
        y += 10
        parts.append(f'<line x1="30" y1="{y}" x2="{width-30}" y2="{y}" stroke="#333"/>')
        y += 22
        for name, value in nutrients.items():
            parts.append(text(40, y, name, size=12))
            parts.append(text(width - 100, y, str(value), size=12, weight="bold"))
            y += 22
        y += 20

    if data.get("net_quantity") or data.get("mrp"):
        line = " · ".join(filter(None, [data.get("net_quantity"), data.get("mrp")]))
        parts.append(text(30, y, line, size=12))
        y += 25

    if data.get("manufacturer_name"):
        parts.append(text(30, y, f"Manufactured by: {data['manufacturer_name']}", size=11, fill="#555"))
        y += 16
    if data.get("manufacturer_address"):
        parts.append(text(30, y, data["manufacturer_address"], size=11, fill="#555"))
        y += 16
    if data.get("fssai_license"):
        parts.append(text(30, y, f"FSSAI Lic. No: {data['fssai_license']}", size=11, fill="#555"))
        y += 20

    parts.append("</svg>")
    return "\n".join(parts)