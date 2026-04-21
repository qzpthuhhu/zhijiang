-- 智匠智装 种子数据初始化SQL

-- 插入服务分类
INSERT INTO service_categories (id, slug, name, description, icon) VALUES
    (uuid_generate_v4(), 'openclaw', 'OpenClaw 安装部署', '专业团队为您提供 OpenClaw 本地化部署服务，支持 Windows、Linux、Mac 全平台', 'robot'),
    (uuid_generate_v4(), 'claude-code', 'Claude Code 配置', 'Claude Code 集成配置，环境搭建，定制化开发服务', 'code'),
    (uuid_generate_v4(), 'vibe-coding', 'Vibe Coding 大师答疑', 'AI 辅助编程指导，帮你快速构建 Web 应用和小程序', 'message-circle'),
    (uuid_generate_v4(), 'rag', 'RAG 方案与部署', '企业级知识库搭建，RAG 技术方案咨询与实施', 'database'),
    (uuid_generate_v4(), 'multi-agent', '多 Agent 系统', '多智能体协作系统架构设计与开发', 'network')
ON CONFLICT (slug) DO NOTHING;

-- 插入 OpenClaw 服务套餐
INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'openclaw-basic',
    '基础安装',
    299,
    '包含环境检测、一键安装配置、基础使用指导',
    '个人开发者、技术爱好者',
    '["环境检测", "一键安装", "基础配置", "使用文档", "远程指导"]',
    TRUE
FROM service_categories WHERE slug = 'openclaw';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'openclaw-pro',
    '进阶部署',
    999,
    '包含高可用配置、性能优化、安全加固、定制开发',
    '中小企业、技术团队',
    '["高可用架构", "性能优化", "安全加固", "API 集成", "7x4 小时支持"]',
    TRUE
FROM service_categories WHERE slug = 'openclaw';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'openclaw-enterprise',
    '企业部署',
    4999,
    '专属技术顾问、架构设计、运维培训、长期维护',
    '大型企业、政府机构',
    '["专属顾问", "架构设计", "运维培训", "7x24 维护", "SLA 保障"]',
    TRUE
FROM service_categories WHERE slug = 'openclaw';

-- 插入 Claude Code 服务套餐
INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'claude-code-quick',
    '快速接入',
    199,
    '30 分钟内完成环境配置，快速开始 AI 编程之旅',
    '个人开发者、初学者',
    '["环境安装", "基础配置", "入门指导", "常见问题解答"]',
    TRUE
FROM service_categories WHERE slug = 'claude-code';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'claude-code-advanced',
    '高级配置',
    599,
    '深度定制、自动化工作流、多工具链集成',
    '专业开发者、技术团队',
    '["深度定制", "工作流配置", "工具链集成", "团队协作优化"]',
    TRUE
FROM service_categories WHERE slug = 'claude-code';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'claude-code-team',
    '团队方案',
    2999,
    '企业级团队部署、权限管理、统一配置、培训支持',
    '企业技术团队、研发部门',
    '["团队部署", "权限管理", "统一配置", "团队培训", "技术支持"]',
    TRUE
FROM service_categories WHERE slug = 'claude-code';

-- 插入 Vibe Coding 服务套餐
INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'vibe-single',
    '单次答疑',
    199,
    '针对具体问题的一次性解答，时长 30 分钟',
    '个人开发者、创业者',
    '["30 分钟答疑", "具体问题解答", "方案建议", "后续行动指引"]',
    TRUE
FROM service_categories WHERE slug = 'vibe-coding';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'vibe-deep',
    '1小时深度指导',
    499,
    '深入项目指导，帮你梳理技术方案和实现路径',
    '有明确项目的开发者',
    '["1 小时深度沟通", "项目分析", "技术方案设计", "代码审查"]',
    TRUE
FROM service_categories WHERE slug = 'vibe-coding';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'vibe-accompany',
    '项目陪跑',
    1999,
    '全程项目指导，从概念到上线，手把手教你完成',
    '需要完整项目指导的用户',
    '["全程指导", "需求分析", "架构设计", "代码实现", "上线部署"]',
    TRUE
FROM service_categories WHERE slug = 'vibe-coding';

-- 插入 RAG 服务套餐
INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'rag-consult',
    'RAG 咨询答疑',
    299,
    'RAG 技术选型、方案设计、问题诊断',
    '想了解 RAG 技术的团队',
    '["技术咨询", "方案评估", "问题诊断", "建议报告"]',
    TRUE
FROM service_categories WHERE slug = 'rag';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'rag-demo',
    'RAG Demo 搭建',
    1999,
    '基于您的数据源，快速搭建可演示的 RAG 原型',
    '需要概念验证的企业',
    '["数据接入", "向量检索", "问答界面", "Demo 交付", "技术文档"]',
    TRUE
FROM service_categories WHERE slug = 'rag';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'rag-enterprise',
    '企业知识库方案',
    9999,
    '完整企业级知识库系统，包含私有化部署和培训',
    '需要私有化部署的企业',
    '["架构设计", "私有化部署", "数据迁移", "运维培训", "长期支持"]',
    TRUE
FROM service_categories WHERE slug = 'rag';

-- 插入多 Agent 服务套餐
INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'multi-agent-consult',
    '架构答疑',
    399,
    '多 Agent 系统架构设计、技术选型咨询',
    '技术决策者、架构师',
    '["架构设计", "技术选型", "方案评估", "最佳实践"]',
    TRUE
FROM service_categories WHERE slug = 'multi-agent';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'multi-agent-demo',
    'Demo 搭建',
    2999,
    '基于需求搭建多 Agent 协作原型系统',
    '需要验证概念的企业',
    '["需求分析", "Agent 设计", "工作流配置", "Demo 交付"]',
    TRUE
FROM service_categories WHERE slug = 'multi-agent';

INSERT INTO service_packages (category_id, slug, name, price, description, target_users, features, is_active)
SELECT 
    id,
    'multi-agent-enterprise',
    '企业多智能体方案',
    19999,
    '完整企业级多智能体系统，从设计到落地',
    '需要完整解决方案的企业',
    '["深度咨询", "系统设计", "完整开发", "私有化部署", "培训交付"]',
    TRUE
FROM service_categories WHERE slug = 'multi-agent';