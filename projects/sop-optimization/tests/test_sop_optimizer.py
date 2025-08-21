#!/usr/bin/env python3
"""
SOP优化器的单元测试
"""

import os
import tempfile
import unittest
from pathlib import Path
from sop_optimizer import SOPOptimizer, DocumentProcessor, QualityChecker, ReportGenerator


class TestSOPOptimizer(unittest.TestCase):
    """SOPOptimizer单元测试"""

    def setUp(self):
        """测试前准备"""
        self.optimizer = SOPOptimizer()
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        """测试后清理"""
        # 清理临时文件
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_init_default_config(self):
        """测试默认配置初始化"""
        optimizer = SOPOptimizer()
        self.assertIsNotNone(optimizer.config)
        self.assertIn('optimization', optimizer.config)
        self.assertIn('output', optimizer.config)

    def test_init_custom_config(self):
        """测试自定义配置初始化"""
        config_content = """
optimization:
  rules:
    - format_consistency
output:
  format: markdown
  include_report: true
"""
        config_path = os.path.join(self.test_dir, 'config.yaml')
        with open(config_path, 'w') as f:
            f.write(config_content)

        optimizer = SOPOptimizer(config_path)
        self.assertEqual(optimizer.config['output']['format'], 'markdown')

    def test_optimize_document_success(self):
        """测试文档优化成功"""
        # 创建测试文档
        test_content = "# 测试文档\n\n这是一份测试文档。"
        input_path = os.path.join(self.test_dir, 'test.md')
        output_path = os.path.join(self.test_dir, 'optimized.md')

        with open(input_path, 'w', encoding='utf-8') as f:
            f.write(test_content)

        # 执行优化
        result = self.optimizer.optimize_document(input_path, output_path)

        # 验证结果
        self.assertTrue(result)
        self.assertTrue(os.path.exists(output_path))

    def test_optimize_document_nonexistent(self):
        """测试优化不存在的文档"""
        result = self.optimizer.optimize_document(
            '/nonexistent/path.md',
            os.path.join(self.test_dir, 'output.md')
        )
        self.assertFalse(result)

    def test_optimize_directory(self):
        """测试目录优化"""
        # 创建测试目录结构
        input_dir = os.path.join(self.test_dir, 'input')
        output_dir = os.path.join(self.test_dir, 'output')
        os.makedirs(input_dir)

        # 创建测试文件
        test_file = os.path.join(input_dir, 'test.md')
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write('# 测试文档')

        # 执行目录优化
        results = self.optimizer.optimize_directory(input_dir, output_dir)

        # 验证结果
        self.assertIn('test.md', results)
        self.assertTrue(results['test.md'])
        self.assertTrue(os.path.exists(os.path.join(output_dir, 'test.md')))


class TestDocumentProcessor(unittest.TestCase):
    """DocumentProcessor单元测试"""

    def setUp(self):
        self.processor = DocumentProcessor()
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_parse_document_success(self):
        """测试文档解析成功"""
        test_content = "# 测试文档\n\n文档内容"
        file_path = os.path.join(self.test_dir, 'test.md')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(test_content)

        result = self.processor.parse_document(file_path)

        self.assertIsNotNone(result)
        self.assertEqual(result['path'], file_path)
        self.assertIn('content', result)
        self.assertIn('metadata', result)

    def test_parse_document_nonexistent(self):
        """测试解析不存在的文档"""
        result = self.processor.parse_document('/nonexistent/path.md')
        self.assertIsNone(result)


class TestQualityChecker(unittest.TestCase):
    """QualityChecker单元测试"""

    def setUp(self):
        self.checker = QualityChecker()

    def test_check_document(self):
        """测试文档质量检查"""
        document = {
            'path': 'test.md',
            'content': '# 测试文档',
            'metadata': {}
        }

        result = self.checker.check_document(document)

        self.assertIsNotNone(result)
        self.assertIn('score', result)
        self.assertIn('issues', result)
        self.assertIn('checked_at', result)


class TestReportGenerator(unittest.TestCase):
    """ReportGenerator单元测试"""

    def setUp(self):
        self.generator = ReportGenerator()
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_generate_report(self):
        """测试报告生成"""
        quality_report = {'score': 85, 'issues': []}
        document = {'path': 'test.md'}
        output_path = os.path.join(self.test_dir, 'report.html')

        self.generator.generate_report(quality_report, document, output_path)

        self.assertTrue(os.path.exists(output_path))

        # 检查报告内容
        with open(output_path, 'r', encoding='utf-8') as f:
            content = f.read()
            self.assertIn('SOP优化报告', content)
            self.assertIn('85', content)


class TestIntegration(unittest.TestCase):
    """集成测试"""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.optimizer = SOPOptimizer()

    def tearDown(self):
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_full_optimization_workflow(self):
        """测试完整的优化工作流"""
        # 创建测试文档
        test_content = """# SOP测试文档

## 概述
这是一个测试文档。

## 步骤
1. 步骤一
2. 步骤二

## 注意事项
- 注意事项1
- 注意事项2
"""

        input_path = os.path.join(self.test_dir, 'workflow_test.md')
        output_path = os.path.join(self.test_dir, 'workflow_optimized.md')

        with open(input_path, 'w', encoding='utf-8') as f:
            f.write(test_content)

        # 执行完整优化流程
        result = self.optimizer.optimize_document(input_path, output_path)

        # 验证结果
        self.assertTrue(result)
        self.assertTrue(os.path.exists(output_path))

        # 验证输出内容
        with open(output_path, 'r', encoding='utf-8') as f:
            content = f.read()
            self.assertIn('优化后的文档', content)


def run_tests():
    """运行所有测试"""
    unittest.main(verbosity=2)


if __name__ == '__main__':
    run_tests()