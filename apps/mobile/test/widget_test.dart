// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:driveai_mobile/main.dart';

void main() {
  testWidgets('DriveAI shell renders key sections', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const DriveAiApp());

    expect(find.text('DriveAI'), findsOneWidget);
    expect(find.text('세션 시작'), findsOneWidget);
    expect(find.text('Flutter-first prototype'), findsOneWidget);
    expect(find.text('이번 구조 전환에서 잡는 기준'), findsOneWidget);
  });
}
