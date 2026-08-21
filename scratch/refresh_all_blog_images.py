import httpx
import json

SUPABASE_URL = 'https://gqqzcznxncatfovulmtp.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcXpjem54bmNhdGZvdnVsbXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzEzNzYsImV4cCI6MjA5OTA0NzM3Nn0.1HoimV4vDtSOwSGnEshnUp68qDWxCHxus5RN07c7a1I'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Image lookup based on specific technical domains
TOPIC_IMAGE_MAPPING = {
    "position-profiling-game-worlds": {
        "title": "Position: Profiling Game Worlds by Transition Complexity",
        "image": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "A deep dive into measuring spatial transition complexity, procedural world generation, and game physics algorithms."
    },
    "position-collusion-risks-among": {
        "title": "Position: Collusion Risks Among AI Reasoning Agents Justified by Game Theory",
        "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Analyzing Nash equilibrium dynamics, multi-agent communication protocols, and emergent collusion vectors in autonomous reasoning systems."
    },
    "h-2-edl-hyper-evidential-deep-": {
        "title": "H²EDL: Hyper Evidential Deep Learning for Hierarchical Classification",
        "image": "https://images.unsplash.com/photo-1639322537504-642750d53c29?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Quantifying epistemic uncertainty across deep neural hierarchies using Dirichlet prior distributions and evidential learning."
    },
    "accelerating-visual-on-policy-": {
        "title": "Accelerating Visual On-Policy Distillation with Batched Speculative Execution",
        "image": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "High-throughput policy distillation combining visual feature extraction with speculative parallel rollout batches on modern GPUs."
    },
    "towards-reversible-forgetting-": {
        "title": "Towards Reversible Forgetting: Managing Obsolete Knowledge in Neural Models",
        "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Techniques for selectively unlearning outdated facts from large neural weights while preserving core reasoning abilities."
    },
    "entropy-constrained-adaptive-s": {
        "title": "Entropy-Constrained Adaptive Stochastic Quantization (2026 Guide)",
        "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Optimizing neural network weight compression via entropy-bounded rate-distortion algorithms and stochastic bit allocation."
    },
    "robust-xgboosting-for-regressi": {
        "title": "Robust XGBoosting for Regression (2026 Guide)",
        "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "End-to-end guide to hyperparameter tuning, handling multicollinearity, and gradient boosted tree regression with XGBoost and scikit-learn."
    },
    "basin-efficient-and-extensible": {
        "title": "Basin: Efficient and Extensible Numerical Optimization in Rust",
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Exploring memory-safe, SIMD-accelerated numerical solver architecture and gradient descent optimization routines written in Rust."
    },
    "why-ai-detection-fails-for-aca": {
        "title": "Why AI Detection Fails for Academic Integrity: A Statistical Analysis",
        "image": "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Examining statistical perplexity thresholds, false positive disparities against non-native writers, and the limits of watermarking."
    },
    "risk-aware-decision-policies-f": {
        "title": "Risk-Aware Decision Policies for Agents in High-Stakes Environments",
        "image": "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Formalizing safety constraints, conditional value-at-risk (CVaR) objectives, and defensive policy boundaries for autonomous agents."
    },
    "from-continuous-predictors-to-": {
        "title": "From Continuous Predictors to Clinical Triage: Healthcare ML Pipelines",
        "image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Deploying clinical regression models with automated patient risk categorization, calibration curves, and secure API telemetry."
    },
    "nextjs-supabase-rls-production": {
        "title": "Production Next.js 14 & Supabase RLS: Complete Security & Performance Blueprint",
        "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        "excerpt": "A comprehensive guide to building zero-trust Next.js applications with Supabase Row-Level Security, server-side caching, and sub-300ms API response times."
    },
    "clinical-glucose-prediction-py": {
        "title": "Machine Learning in Healthcare: Building Clinical Glucose Prediction Models",
        "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Inside the architecture of an ElasticNet regression ML model trained to predict blood glucose levels in clinical patient monitoring systems."
    },
    "rbac-nextjs-app-router": {
        "title": "How I think about RBAC in Next.js App Router & Server Components",
        "image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Structuring role-based access control across middleware, nested layout boundaries, and database query filters in Next.js."
    },
    "ai-integration-security-risks": {
        "title": "AI Integration Risks: An Application Security Perspective",
        "image": "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Analyzing prompt injection paths, data exposure vectors, and insecure output rendering in production LLM integrations."
    },
    "building-glassmorphism-uis": {
        "title": "Building glass UIs that still pass a readability test",
        "image": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1200&q=80",
        "excerpt": "Blur is optional. Hierarchy, contrast, and borders are not — practical notes from shipping frosted glass product surfaces."
    },
    "nextjs-app-router-patterns": {
        "title": "App Router patterns I reach for on product work",
        "image": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
        "excerpt": "Practical architectural patterns for Next.js App Router — parallel data fetching, streaming UI fallbacks, and optimistic mutations."
    },
    "portfolio-performance-checklis": {
        "title": "A practical performance checklist for portfolio websites",
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        "excerpt": "How to achieve 98+ Lighthouse scores on Next.js portfolios with dynamic font subsetting, WebP conversion, and bundle optimization."
    }
}

# 1. Fetch current blogs from Supabase
r = httpx.get(f'{SUPABASE_URL}/rest/v1/site_settings?key=eq.blogs_store_json&select=*', headers=headers)
rows = r.json()
if not rows:
    print("Error: No blogs_store_json in Supabase")
    exit(1)

blogs = json.loads(rows[0]['value'])
print(f"Loaded {len(blogs)} blogs from Supabase")

updated_blogs = []
for b in blogs:
    slug = b.get('slug', '')
    # Match by slug prefix
    match_key = next((k for k in TOPIC_IMAGE_MAPPING if slug.startswith(k)), None)
    
    if match_key:
        info = TOPIC_IMAGE_MAPPING[match_key]
        b['coverImage'] = info['image']
        b['title'] = info['title']
        b['excerpt'] = info['excerpt']
        print(f"[UPDATED] {slug[:30]} -> {info['image'][:50]}")
    else:
        print(f"[UNCHANGED] {slug[:30]}")
    
    updated_blogs.append(b)

# 2. Save back to Supabase site_settings
upsert_payload = [{
    "key": "blogs_store_json",
    "value": json.dumps(updated_blogs),
    "updated_at": "2026-08-21T03:40:00.000Z"
}]

save_res = httpx.post(
    f'{SUPABASE_URL}/rest/v1/site_settings?on_conflict=key',
    headers={**headers, 'Prefer': 'resolution=merge-duplicates,return=representation'},
    json=upsert_payload,
    timeout=20.0
)
print("Supabase site_settings updated:", save_res.status_code)

# 3. Also update local blogs.json
with open('data/blogs.json', 'w', encoding='utf-8') as f:
    json.dump(updated_blogs, f, indent=2, ensure_ascii=False)
print("Local data/blogs.json updated successfully!")
