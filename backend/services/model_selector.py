"""
Intelligent Model Selector for Cost Optimization
Implements the "Model Whisperer" strategy
"""
from typing import Dict, Any, Literal
import json

TaskType = Literal["quick_summary", "roast", "personality", "deep_analysis", "hidden_gems", "comparison"]

class ModelSelector:
    """
    Intelligently selects the most cost-effective model for each task.
    
    Cost per 1M tokens (input/output):
    - amazon.nova-micro-v1:0     : $0.035 / $0.14
    - amazon.nova-lite-v1:0      : $0.06 / $0.24  
    - anthropic.claude-3-haiku   : $0.25 / $1.25
    - amazon.nova-pro-v1:0       : $0.80 / $3.20
    """
    
    MODEL_COSTS = {
        "amazon.nova-micro-v1:0": {"input": 0.035, "output": 0.14, "name": "Nova Micro"},
        "amazon.nova-lite-v1:0": {"input": 0.06, "output": 0.24, "name": "Nova Lite"},
        "anthropic.claude-3-haiku-20240307-v1:0": {"input": 0.25, "output": 1.25, "name": "Claude Haiku"},
        "anthropic.claude-sonnet-4-20250514-v1:0": {"input": 3.00, "output": 15.00, "name": "Claude Sonnet 4"},
        "deepseek.v3-v1:0": {"input": 0.27, "output": 1.10, "name": "DeepSeek V3"},
        "amazon.nova-pro-v1:0": {"input": 0.80, "output": 3.20, "name": "Nova Pro"}
    }
    
    TASK_MODEL_MAP = {
        "quick_summary": "amazon.nova-micro-v1:0",      # Cheapest for simple summaries
        "roast": "amazon.nova-lite-v1:0",                # Good creative writing, no approval needed
        "personality": "amazon.nova-lite-v1:0",          # Good for structured creative output
        "deep_analysis": "amazon.nova-lite-v1:0",        # Decent reasoning
        "hidden_gems": "amazon.nova-lite-v1:0",          # Pattern recognition
        "comparison": "amazon.nova-lite-v1:0"            # Good for comparisons
    }
    
    def __init__(self):
        self.usage_stats = {
            "total_tokens": 0,
            "total_cost": 0,
            "calls_by_model": {},
            "tasks_completed": 0
        }
    
    def select_model(self, task_type: TaskType, complexity: str = "medium") -> str:
        """
        Select the optimal model for a given task
        
        Args:
            task_type: Type of task to perform
            complexity: Task complexity (low/medium/high)
            
        Returns:
            Model ID to use
        """
        base_model = self.TASK_MODEL_MAP.get(task_type, "amazon.nova-lite-v1:0")
        
        # Upgrade to better model for high complexity
        if complexity == "high" and "micro" in base_model:
            return "amazon.nova-lite-v1:0"
        elif complexity == "high" and "lite" in base_model:
            return "anthropic.claude-3-haiku-20240307-v1:0"
        
        return base_model
    
    def estimate_cost(
        self, 
        model_id: str, 
        input_tokens: int, 
        output_tokens: int
    ) -> float:
        """
        Estimate cost for a model invocation
        
        Args:
            model_id: Model identifier
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            
        Returns:
            Estimated cost in USD
        """
        if model_id not in self.MODEL_COSTS:
            return 0.0
        
        costs = self.MODEL_COSTS[model_id]
        input_cost = (input_tokens / 1_000_000) * costs["input"]
        output_cost = (output_tokens / 1_000_000) * costs["output"]
        
        return input_cost + output_cost
    
    def track_usage(
        self, 
        model_id: str, 
        input_tokens: int, 
        output_tokens: int
    ):
        """Track model usage and costs"""
        cost = self.estimate_cost(model_id, input_tokens, output_tokens)
        
        self.usage_stats["total_tokens"] += input_tokens + output_tokens
        self.usage_stats["total_cost"] += cost
        self.usage_stats["tasks_completed"] += 1
        
        if model_id not in self.usage_stats["calls_by_model"]:
            self.usage_stats["calls_by_model"][model_id] = {
                "calls": 0,
                "total_cost": 0,
                "tokens": 0
            }
        
        self.usage_stats["calls_by_model"][model_id]["calls"] += 1
        self.usage_stats["calls_by_model"][model_id]["total_cost"] += cost
        self.usage_stats["calls_by_model"][model_id]["tokens"] += input_tokens + output_tokens
    
    def get_usage_report(self) -> Dict[str, Any]:
        """Generate usage and cost report"""
        report = {
            "total_tasks": self.usage_stats["tasks_completed"],
            "total_tokens": self.usage_stats["total_tokens"],
            "total_cost_usd": round(self.usage_stats["total_cost"], 4),
            "avg_cost_per_task": round(
                self.usage_stats["total_cost"] / max(self.usage_stats["tasks_completed"], 1), 
                4
            ),
            "models_used": []
        }
        
        for model_id, stats in self.usage_stats["calls_by_model"].items():
            model_name = self.MODEL_COSTS.get(model_id, {}).get("name", model_id)
            report["models_used"].append({
                "model": model_name,
                "calls": stats["calls"],
                "tokens": stats["tokens"],
                "cost_usd": round(stats["total_cost"], 4),
                "percentage": round(
                    (stats["total_cost"] / max(self.usage_stats["total_cost"], 0.0001)) * 100,
                    1
                )
            })
        
        return report
    
    def get_optimization_tips(self) -> list:
        """Get tips for further cost optimization"""
        tips = []
        
        if self.usage_stats["avg_cost_per_task"] > 0.01:
            tips.append("Consider using more micro/lite models for simple tasks")
        
        # Check if expensive models are overused
        for model_id, stats in self.usage_stats["calls_by_model"].items():
            if "pro" in model_id and stats["calls"] > 5:
                tips.append(f"You're using expensive models frequently. Consider alternatives.")
        
        if not tips:
            tips.append("Your model usage is well optimized! 🎉")
        
        return tips

# Global instance
model_selector = ModelSelector()

