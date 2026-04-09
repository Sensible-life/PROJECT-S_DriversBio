import 'package:flutter/material.dart';

void main() {
  runApp(const DriveAiApp());
}

class DriveAiApp extends StatelessWidget {
  const DriveAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    const surface = Color(0xFFFFFBF4);
    const ink = Color(0xFF152033);
    const accent = Color(0xFF0F766E);
    const warm = Color(0xFFF59E0B);

    return MaterialApp(
      title: 'DriveAI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: surface,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          primary: accent,
          secondary: warm,
          surface: surface,
        ),
        textTheme: const TextTheme(
          displaySmall: TextStyle(
            fontSize: 34,
            height: 1.05,
            fontWeight: FontWeight.w700,
            color: ink,
          ),
          headlineSmall: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: ink,
          ),
          titleMedium: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: ink,
          ),
          bodyLarge: TextStyle(fontSize: 16, height: 1.5, color: ink),
          bodyMedium: TextStyle(
            fontSize: 14,
            height: 1.5,
            color: Color(0xFF425066),
          ),
        ),
      ),
      home: const DriveAiHomePage(),
    );
  }
}

class DriveAiHomePage extends StatelessWidget {
  const DriveAiHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFFFF4DB), Color(0xFFF6FAF8), Color(0xFFE7F1FF)],
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF152033),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x22152033),
                      blurRadius: 28,
                      offset: Offset(0, 18),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0x26FFFFFF),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Text(
                        'DriveAI',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Flutter-first prototype',
                      style: TextStyle(
                        color: Color(0xFFD8E2F1),
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      '운전 중에는 듣고,\n멈춰 있을 때만 본다.',
                      style: theme.textTheme.displaySmall?.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'DriveAI를 Flutter 앱 중심으로 전환하는 첫 단계예요. '
                      '이제 모바일 클라이언트가 제품의 기준면이 됩니다.',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: const Color(0xFFD8E2F1),
                      ),
                    ),
                    const SizedBox(height: 22),
                    Row(
                      children: [
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.play_arrow_rounded),
                            label: const Text('세션 시작'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.mic_none_rounded),
                            label: const Text('음성 준비'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Color(0x52FFFFFF)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const _SectionTitle('이번 구조 전환에서 잡는 기준'),
              const SizedBox(height: 12),
              const _FeatureCard(
                icon: Icons.mobile_friendly_rounded,
                title: '단일 앱 중심',
                body: '세션 실행, 약점 복습, 자료 확인의 중심을 Flutter 앱으로 모읍니다.',
              ),
              const SizedBox(height: 12),
              const _FeatureCard(
                icon: Icons.record_voice_over_rounded,
                title: '오디오 우선 UX',
                body: '운전 중에는 짧은 발화와 짧은 피드백에 집중하고 긴 설명은 종료 후로 넘깁니다.',
              ),
              const SizedBox(height: 12),
              const _FeatureCard(
                icon: Icons.hub_rounded,
                title: 'API 연결 준비',
                body:
                    '기존 Node API와 session-engine을 유지한 채 Flutter에서 붙일 수 있게 전환합니다.',
              ),
              const SizedBox(height: 24),
              const _SectionTitle('초기 앱 정보 구조'),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: const [
                  _Pill(label: 'Home'),
                  _Pill(label: 'Session'),
                  _Pill(label: 'Sources'),
                  _Pill(label: 'Weak Points'),
                  _Pill(label: 'Settings'),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.82),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0x140F172A)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('다음 구현 순서', style: theme.textTheme.headlineSmall),
                    const SizedBox(height: 14),
                    const _ChecklistRow(
                      title: '앱 라우팅과 폴더 구조 분리',
                      caption: 'presentation, domain, data 레이어 정리',
                    ),
                    const _ChecklistRow(
                      title: 'API 클라이언트 연결',
                      caption: 'study source, sessions, answers 엔드포인트 연결',
                    ),
                    const _ChecklistRow(
                      title: '세션 화면과 답변 흐름 구현',
                      caption: '질문 표시, 답변 제출, 피드백 렌더링',
                    ),
                    const _ChecklistRow(
                      title: '음성 입력과 오디오 재생 연결',
                      caption: 'STT/TTS 또는 플랫폼 기능 통합',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: Theme.of(context).textTheme.headlineSmall);
  }
}

class _FeatureCard extends StatelessWidget {
  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0x140F172A)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFE4F5F0),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: const Color(0xFF0F766E)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(body, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7E6BC),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 14),
      ),
    );
  }
}

class _ChecklistRow extends StatelessWidget {
  const _ChecklistRow({required this.title, required this.caption});

  final String title;
  final String caption;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 3),
            child: Icon(
              Icons.check_circle_rounded,
              size: 18,
              color: Color(0xFF0F766E),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 2),
                Text(caption, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
