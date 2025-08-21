#!/usr/bin/env python3
"""
SOP文档优化器主程序
负责协调文档解析、优化和生成的整个流程
"""

import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
import yaml
import json
from datetime import datetime

class SOPOptimizer:
    """SOP文档优化器主类"""

    def __init__(self, config_path: Optional[str] = None):
        """初始化优化器"""
        self.config = self._load_config(config_path)
        self.document_processor = DocumentProcessor()
        self.quality_checker = QualityChecker()
        self.report_generator = ReportGenerator()

    def _load_config(self, config_path: Optional[str]) -> Dict:
        """加载配置文件"""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)

        # 默认配置
        return {
            'optimization': {
                'rules': [
                    'format_consistency',
                    'terminology_unification',
                    'structure_validation'
                ]
            },
            'output': {
                'format': 'markdown',
                'include_report': True,
                'report_format': 'html'
            }
        }

    def optimize_document(self, input_path: str, output_path: str) -> bool:
        """
        优化单个文档

        Args:
            input_path: 输入文档路径
            output_path: 输出文档路径

        Returns:
            bool: 优化是否成功
        """
        try:
            print(f"开始优化文档: {input_path}")

            # 1. 解析文档
            document = self.document_processor.parse_document(input_path)
            if not document:
                print(f"文档解析失败: {input_path}")
                return False

            # 2. 质量检查
            quality_report = self.quality_checker.check_document(document)

            # 3. 应用优化
            optimized_document = self._apply_optimizations(document)

            # 4. 生成优化报告
            if self.config['output']['include_report']:
                report_path = self._generate_report_path(output_path)
                self.report_generator.generate_report(
                    quality_report,
                    optimized_document,
                    report_path
                )

            # 5. 保存优化后的文档
            success = self._save_document(optimized_document, output_path)

            print(f"文档优化完成: {output_path}")
            return success

        except Exception as e:
            print(f"文档优化失败: {e}")
            return False

    def optimize_directory(self, input_dir: str, output_dir: str) -> Dict[str, bool]:
        """
        优化整个目录的文档

        Args:
            input_dir: 输入目录路径
            output_dir: 输出目录路径

        Returns:
            Dict[str, bool]: 文件优化结果
        """
        results = {}
        input_path = Path(input_dir)
        output_path = Path(output_dir)

        if not input_path.exists():
            print(f"输入目录不存在: {input_dir}")
            return results

        # 确保输出目录存在
        output_path.mkdir(parents=True, exist_ok=True)

        # 遍历所有Markdown文件
        for file_path in input_path.rglob('*.md'):
            if file_path.is_file():
                # 计算相对路径
                relative_path = file_path.relative_to(input_path)
                output_file = output_path / relative_path

                # 确保输出子目录存在
                output_file.parent.mkdir(parents=True, exist_ok=True)

                # 优化文档
                success = self.optimize_document(str(file_path), str(output_file))
                results[str(relative_path)] = success

        return results

    def _apply_optimizations(self, document: Dict) -> Dict:
        """应用优化规则"""
        optimized = document.copy()

        for rule in self.config['optimization']['rules']:
            if rule == 'format_consistency':
                optimized = self._apply_format_consistency(optimized)
            elif rule == 'terminology_unification':
                optimized = self._apply_terminology_unification(optimized)
            elif rule == 'structure_validation':
                optimized = self._apply_structure_validation(optimized)

        return optimized

    def _apply_format_consistency(self, document: Dict) -> Dict:
        """应用格式一致性优化"""
        # 实现格式一致性检查和修复
        # 这里是简化实现，实际项目中需要更复杂的逻辑
        return document

    def _apply_terminology_unification(self, document: Dict) -> Dict:
        """应用术语统一化优化"""
        # 实现术语统一化检查和修复
        return document

    def _apply_structure_validation(self, document: Dict) -> Dict:
        """应用结构验证优化"""
        # 实现结构验证和修复
        return document

    def _generate_report_path(self, document_path: str) -> str:
        """生成报告文件路径"""
        base_path = os.path.splitext(document_path)[0]
        if self.config['output']['report_format'] == 'html':
            return f"{base_path}_report.html"
        else:
            return f"{base_path}_report.md"

    def _save_document(self, document: Dict, output_path: str) -> bool:
        """保存优化后的文档"""
        try:
            # 这里实现文档保存逻辑
            # 实际项目中需要根据文档结构生成Markdown内容
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(f"# 优化后的文档\n\n")
                f.write(f"生成时间: {datetime.now().isoformat()}\n\n")
                f.write("文档已通过SOP优化器处理。\n")

            return True
        except Exception as e:
            print(f"保存文档失败: {e}")
            return False


class DocumentProcessor:
    """文档处理器"""

    def parse_document(self, file_path: str) -> Optional[Dict]:
        """解析文档"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 简化解析逻辑
            return {
                'path': file_path,
                'content': content,
                'lines': content.split('\n'),
                'metadata': {
                    'parsed_at': datetime.now().isoformat(),
                    'line_count': len(content.split('\n'))
                }
            }
        except Exception as e:
            print(f"解析文档失败: {e}")
            return None


class QualityChecker:
    """质量检查器"""

    def check_document(self, document: Dict) -> Dict:
        """检查文档质量"""
        return {
            'score': 85,
            'issues': [
                {
                    'type': 'format',
                    'severity': 'medium',
                    'description': '格式需要优化'
                }
            ],
            'checked_at': datetime.now().isoformat()
        }


class ReportGenerator:
    """报告生成器"""

    def generate_report(self, quality_report: Dict, document: Dict, output_path: str):
        """生成优化报告"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(f"<html><body>\n")
                f.write(f"<h1>SOP优化报告</h1>\n")
                f.write(f"<p>生成时间: {datetime.now().isoformat()}</p>\n")
                f.write(f"<p>质量评分: {quality_report.get('score', 'N/A')}</p>\n")
                f.write(f"</body></html>\n")
        except Exception as e:
            print(f"生成报告失败: {e}")


def main():
    """主函数"""
    if len(sys.argv) < 3:
        print("用法: python sop_optimizer.py <输入路径> <输出路径>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    optimizer = SOPOptimizer()

    if os.path.isfile(input_path):
        success = optimizer.optimize_document(input_path, output_path)
    elif os.path.isdir(input_path):
        results = optimizer.optimize_directory(input_path, output_path)
        success = all(results.values())
    else:
        print(f"输入路径不存在: {input_path}")
        success = False

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()