import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    PRIMARY = colors.HexColor("#0f172a")
    ACCENT = colors.HexColor("#4338ca")
    TEXT_DARK = colors.HexColor("#334155")
    MUTED = colors.HexColor("#64748b")
    LINE_COLOR = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13.5,
        textColor=ACCENT,
    )

    contact_style = ParagraphStyle(
        "ContactInfo",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=MUTED,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13.5,
        textColor=PRIMARY,
        spaceBefore=7,
        spaceAfter=3,
    )

    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
    )

    bullet_style = ParagraphStyle(
        "BulletStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.2,
        leading=11,
        textColor=TEXT_DARK,
        leftIndent=8,
    )

    story = []

    # 1. Header Section
    story.append(Paragraph("Abdul Nabi", title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Full-Stack Developer &bull; Data & ML &bull; AppSec Learner", subtitle_style))
    story.append(Spacer(1, 3))
    
    contact_text = (
        "Email: <b>abdulnabi.khaskhely@gmail.com</b> | Phone: <b>+92 309 3751434</b> | Location: <b>Karachi, Sindh, Pakistan</b><br/>"
        "GitHub: <b>github.com/abdulnabii</b> | LinkedIn: <b>linkedin.com/in/abdul-nabi-95391a3b0</b>"
    )
    story.append(Paragraph(contact_text, contact_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=LINE_COLOR, spaceAfter=6))

    # 2. Executive Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
    summary_text = (
        "Full-Stack Developer and Data Practitioner with expertise in building responsive Next.js web applications, "
        "REST APIs, and applied machine learning models. Proficient in full-stack architecture, Python data pipelines, "
        "and end-to-end model evaluation — with a strong interest and active learning in Application Security (OWASP Top 10, "
        "safe auth, and RLS policies). Passionate about shipping robust, production-ready software."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 4))

    # 3. Technical Skills Matrix
    story.append(Paragraph("TECHNICAL COMPETENCIES", section_heading))
    skills_data = [
        [Paragraph("<b>Frontend & UI:</b>", body_style), Paragraph("React, Next.js (App Router), TypeScript, Tailwind CSS, Responsive Design, Accessibility", body_style)],
        [Paragraph("<b>Backend & APIs:</b>", body_style), Paragraph("Node.js, REST APIs, PostgreSQL, Supabase, Prisma, Auth & Session Management", body_style)],
        [Paragraph("<b>AppSec:</b>", body_style), Paragraph("OWASP Top 10, Auth & RBAC Design, Supabase RLS Policies, XSS/SQLi Prevention, Code Review", body_style)],
        [Paragraph("<b>Data & ML:</b>", body_style), Paragraph("Python, Pandas, Data Analysis, ML Model Training, Data Storytelling, Jupyter Notebooks", body_style)],
        [Paragraph("<b>Tools & Delivery:</b>", body_style), Paragraph("Git, GitHub, Vercel, Postman, CI/CD Workflows, Technical Documentation", body_style)],
    ]
    t_skills = Table(skills_data, colWidths=[105, 435])
    t_skills.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_skills)
    story.append(Spacer(1, 4))

    # 4. Featured Portfolio Projects & Case Studies
    story.append(Paragraph("FEATURED PROJECTS & CASE STUDIES", section_heading))
    
    projects = [
        ("Aurora Analytics", "Multi-Tenant Analytics Platform", "Next.js, TypeScript, Supabase RLS, Charts",
         "Architected multi-tenant workspace with database-level isolation via Supabase RLS policies, preventing cross-tenant data leaks and rendering sub-400ms metrics dashboards."),
        ("Nova Commerce", "Headless Storefront & Checkout", "Next.js (ISR), Stripe, Tailwind CSS",
         "Implemented high-performance storefront with Incremental Static Regeneration (ISR), custom shopping cart state, and server-side signed Stripe payment flows with price-tampering shields."),
        ("Pulse Support Chat", "Edge Streaming Support Assistant", "React, Node.js, Server-Sent Events",
         "Built embeddable chat widget with edge-streamed LLM token delivery (<150ms TTFT), client-side markdown parsing, and rate-limiting safeguards."),
        ("Ops Status Console", "Incident & Service Health Dashboard", "Next.js, PostgreSQL, JWT Auth",
         "Designed minimalist operational status console aggregating service health scrapers and chronological incident logs with 50ms query responses."),
    ]

    for title, subtitle, stack, desc in projects:
        p_head = f"<b>{title}</b> &mdash; <i>{subtitle}</i> <font color='#64748b'>({stack})</font>"
        story.append(Paragraph(p_head, body_style))
        story.append(Paragraph(f"&bull; {desc}", bullet_style))
        story.append(Spacer(1, 2.5))

    story.append(Spacer(1, 2))

    # 5. Work Experience
    story.append(Paragraph("WORK EXPERIENCE", section_heading))
    
    exp_1 = "<b>Full-Stack Developer &bull; AppSec & Data Focus</b> &mdash; Product & Client Projects <font color='#64748b'>(2024 &ndash; Present)</font>"
    story.append(Paragraph(exp_1, body_style))
    story.append(Paragraph("&bull; Owned feature slices across Next.js UI, API routes, and database access layers, enforcing RBAC and Supabase RLS policies.", bullet_style))
    story.append(Paragraph("&bull; Performed application security reviews on REST APIs and route handlers, eliminating authorization logic flaws.", bullet_style))
    story.append(Paragraph("&bull; Applied Python and Pandas for data analysis tasks: cleaning datasets, training ML models, and generating actionable reports.", bullet_style))
    story.append(Spacer(1, 3))

    exp_2 = "<b>Junior Full-Stack Developer</b> &mdash; Freelance & Open Source Projects <font color='#64748b'>(2023 &ndash; 2024)</font>"
    story.append(Paragraph(exp_2, body_style))
    story.append(Paragraph("&bull; Shipped responsive marketing and web app UIs with accessibility and SEO best practices.", bullet_style))
    story.append(Paragraph("&bull; Built RESTful endpoints, database schemas, and data pipelines for client projects.", bullet_style))
    story.append(Spacer(1, 4))

    # 6. Education
    story.append(Paragraph("EDUCATION", section_heading))
    story.append(Paragraph("<b>Computer Science Studies</b> &mdash; Self-Directed & Applied Project Work <i>(Karachi, Sindh, Pakistan)</i>", body_style))
    story.append(Paragraph("&bull; Comprehensive coursework and hands-on projects spanning full-stack development, application security, and applied data science.", bullet_style))

    doc.build(story)
    print(f"Successfully generated resume PDF at: {output_path}")

if __name__ == "__main__":
    os.makedirs("public", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    generate_pdf("public/ab_resume.pdf")
    generate_pdf("data/ab_resume.pdf")
