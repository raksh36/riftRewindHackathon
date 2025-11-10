"""
AWS Bedrock AI Service
Handles AI-powered insight generation using Amazon Bedrock
"""
import boto3
import json
from typing import Dict, Any, List
import os
from .model_selector import model_selector


class BedrockAIService:
    """Service for generating insights using AWS Bedrock"""
    
    def __init__(self, region: str, model_id: str):
        self.region = region
        self.model_id = model_id
        
        # Initialize Bedrock Runtime client
        self.bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name=region,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
    
    async def generate_year_recap(
        self,
        summoner_name: str,
        stats: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate personalized year-end recap using AI
        
        Args:
            summoner_name: Player's summoner name
            stats: Analyzed match statistics
            
        Returns:
            AI-generated insights and narratives
        """
        
        # Prepare context for AI
        prompt = self._build_recap_prompt(summoner_name, stats)
        
        # Generate insights
        response = await self._invoke_bedrock(prompt)
        
        # Parse and structure response
        insights = self._parse_insights(response)
        
        return insights
    
    def _build_recap_prompt(
        self,
        summoner_name: str,
        stats: Dict[str, Any]
    ) -> str:
        """Build prompt for year-end recap generation"""
        
        top_champs = stats.get("topChampions", [])[:3]
        champ_names = ", ".join([c["championName"] for c in top_champs])
        
        prompt = f"""You are an expert League of Legends coach creating a personalized year-end recap for {summoner_name}.

Based on the following statistics, create an engaging, insightful, and encouraging recap:

STATISTICS:
- Total Games: {stats.get('totalGames', 0)}
- Win Rate: {stats.get('winRate', 0):.1f}%
- Average KDA: {stats.get('avgKDA', 0):.2f}
- Top Champions: {champ_names}
- Most Played Role: {stats.get('mostPlayedRole', 'Unknown')}
- Best Performance: {stats.get('bestPerformance', {})}
- Recent Trend: {stats.get('recentTrend', 'Stable')}

Create a response in JSON format with these sections:

1. "narrative": A 2-3 paragraph story about their League journey this year (engaging, personal, celebratory)
2. "strengths": Array of 3-4 key strengths identified from their play patterns
3. "areasForGrowth": Array of 2-3 constructive areas to improve
4. "highlights": Array of 3-5 standout moments or achievements
5. "playstyleDescription": One sentence describing their playstyle
6. "recommendations": Array of 3 specific, actionable tips for improvement

Make it personal, specific to their stats, encouraging, and fun. Use gaming terminology but keep it accessible.

Return ONLY valid JSON, no additional text."""

        return prompt
    
    
    def _parse_insights(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into structured insights"""
        try:
            # Try to parse as JSON
            if ai_response.startswith('{'):
                return json.loads(ai_response)
            
            # Extract JSON from markdown code blocks
            if '```json' in ai_response:
                start = ai_response.find('```json') + 7
                end = ai_response.find('```', start)
                json_str = ai_response[start:end].strip()
                return json.loads(json_str)
            
            if '```' in ai_response:
                start = ai_response.find('```') + 3
                end = ai_response.find('```', start)
                json_str = ai_response[start:end].strip()
                return json.loads(json_str)
            
            # If no JSON found, create structured response from text
            return {
                "narrative": ai_response,
                "strengths": ["Consistent gameplay"],
                "areasForGrowth": ["Keep improving!"],
                "highlights": ["Another great season"],
                "playstyleDescription": "Dedicated player",
                "recommendations": ["Keep playing and having fun!"]
            }
            
        except json.JSONDecodeError:
            # Return fallback
            return self._get_fallback_insights()
    
    def _get_fallback_response(self) -> str:
        """Get fallback response if AI fails"""
        return json.dumps({
            "narrative": "You've had an amazing year on the Rift! Your dedication to improving and learning new champions shows true passion for the game.",
            "strengths": [
                "Consistent playtime and engagement",
                "Willingness to adapt and try new strategies",
                "Strong mechanical foundation"
            ],
            "areasForGrowth": [
                "Focus on vision control in mid-late game",
                "Work on champion pool diversity"
            ],
            "highlights": [
                "Completed another full season",
                "Demonstrated growth mindset",
                "Built strong game knowledge"
            ],
            "playstyleDescription": "A dedicated player focused on continuous improvement",
            "recommendations": [
                "Review replays of your best games to identify what went right",
                "Practice last-hitting in practice tool",
                "Watch high-ELO players for your main champions"
            ]
        })
    
    def _get_fallback_insights(self) -> Dict[str, Any]:
        """Get fallback insights"""
        return json.loads(self._get_fallback_response())
    
    async def generate_playstyle_comparison(
        self,
        player1_stats: Dict[str, Any],
        player2_stats: Dict[str, Any]
    ) -> str:
        """Generate playstyle comparison between two players"""
        
        prompt = f"""Compare these two League of Legends players' playstyles:

Player 1:
- Win Rate: {player1_stats.get('winRate', 0):.1f}%
- Avg KDA: {player1_stats.get('avgKDA', 0):.2f}
- Top Role: {player1_stats.get('mostPlayedRole', 'Unknown')}

Player 2:
- Win Rate: {player2_stats.get('winRate', 0):.1f}%
- Avg KDA: {player2_stats.get('avgKDA', 0):.2f}
- Top Role: {player2_stats.get('mostPlayedRole', 'Unknown')}

In 2-3 sentences, describe how their playstyles differ and if they would complement each other as duo partners."""

        response = await self._invoke_bedrock(prompt, task_type="comparison")
        return response
    
    async def generate_roast(
        self,
        summoner_name: str,
        stats: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a funny roast based on player performance
        Uses Nova Lite for creative, humorous content
        """
        
        # Extract embarrassing stats
        death_avg = stats.get('avgDeaths', 0)
        win_rate = stats.get('winRate', 0)
        kda = stats.get('avgKDA', 0)
        trend = stats.get('recentTrend', 'Unknown')
        
        prompt = f"""You are a savage League of Legends coach who roasts players (but keeps it fun).

Generate a hilarious roast for {summoner_name} based on these stats:
- Average Deaths: {death_avg} per game
- Win Rate: {win_rate:.1f}%
- KDA: {kda:.2f}
- Recent Trend: {trend}

Rules:
1. Be funny and creative, but not mean-spirited
2. Use gaming memes and League terminology
3. 3-5 short, punchy roasts
4. Include emojis
5. Make it shareable and entertaining

Format: Return roasts as a JSON array of strings.
Example: {{"roasts": ["Roast 1", "Roast 2"]}}"""

        response = await self._invoke_bedrock(prompt, task_type="roast")
        
        try:
            parsed = json.loads(response)
            return {"roasts": parsed.get("roasts", [response])}
        except:
            return {"roast": response}
    
    async def analyze_personality(
        self,
        summoner_name: str,
        stats: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate League personality analysis
        Uses Nova Lite for creative personality profiling
        """
        
        prompt = f"""You are a League of Legends psychologist who creates fun personality profiles.

Analyze {summoner_name}'s personality based on their stats:
- Win Rate: {stats.get('winRate', 0):.1f}%
- KDA: {stats.get('avgKDA', 0):.2f}
- Avg Kills: {stats.get('avgKills', 0):.1f}
- Avg Deaths: {stats.get('avgDeaths', 0):.1f}
- Avg Assists: {stats.get('avgAssists', 0):.1f}
- Most Played Role: {stats.get('mostPlayedRole', 'Unknown')}
- Top Champions: {', '.join([c.get('championName', '') for c in stats.get('topChampions', [])[:3]])}

Create a personality profile in JSON format:
{{
  "type": "The [Archetype]",
  "playstyle": "One sentence description",
  "description": "2-3 sentences about their personality",
  "traits": [
    {{"name": "Aggression", "value": 75}},
    {{"name": "Teamwork", "value": 85}},
    {{"name": "Mechanics", "value": 70}},
    {{"name": "Strategy", "value": 80}},
    {{"name": "Adaptability", "value": 75}},
    {{"name": "Consistency", "value": 65}}
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "celebrity": "Pro player they're similar to",
  "archetype": "Short description"
}}

Make it fun, accurate to their stats, and include gaming personality traits."""

        response = await self._invoke_bedrock(prompt, task_type="personality")
        
        try:
            return json.loads(response)
        except:
            return {"type": "The Player", "description": response}
    
    async def discover_hidden_gems(
        self,
        summoner_name: str,
        stats: Dict[str, Any],
        patterns: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate insights about hidden patterns
        Uses Claude Haiku for better pattern analysis
        """
        
        patterns_text = "\n".join([
            f"- {p.get('title', '')}: {p.get('description', '')}" 
            for p in patterns[:5]
        ])
        
        prompt = f"""You are a data scientist analyzing League of Legends gameplay patterns.

For {summoner_name}, we discovered these patterns:
{patterns_text}

Statistics:
- Win Rate: {stats.get('winRate', 0):.1f}%
- KDA: {stats.get('avgKDA', 0):.2f}
- Games: {stats.get('totalGames', 0)}

Generate 3-4 additional surprising insights they might not know about themselves.
Return as JSON:
{{
  "discoveries": [
    {{
      "title": "Discovery Title",
      "description": "Detailed explanation",
      "rarity": 4,
      "actionable": "What they should do with this info"
    }}
  ]
}}

Make insights specific, surprising, and actionable."""

        response = await self._invoke_bedrock(prompt, task_type="hidden_gems")
        
        try:
            parsed = json.loads(response)
            return {"gems": patterns + parsed.get("discoveries", [])}
        except:
            return {"gems": patterns}
    
    async def _invoke_bedrock(
        self, 
        prompt: str, 
        task_type: str = "deep_analysis"
    ) -> str:
        """
        Invoke Bedrock model with intelligent model selection
        
        Args:
            prompt: Input prompt for the model
            task_type: Type of task for model selection
            
        Returns:
            Generated text response
        """
        
        try:
            # Select optimal model for task
            model_id = model_selector.select_model(task_type)
            
            # Estimate tokens (rough approximation)
            input_tokens = len(prompt.split()) * 1.3
            expected_output_tokens = 500 if task_type == "roast" else 1000
            
            print(f"Using {model_id} for {task_type}")
            print(f"Estimated cost: ${model_selector.estimate_cost(model_id, int(input_tokens), expected_output_tokens):.4f}")
            
            # Prepare request body based on model
            if "claude" in model_id.lower():
                body = json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 2000,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "top_p": 0.9
                })
            elif "nova" in model_id.lower():
                # Amazon Nova format
                body = json.dumps({
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "inferenceConfig": {
                        "max_new_tokens": 2000,
                        "temperature": 0.7,
                        "top_p": 0.9
                    }
                })
            else:
                # Default format
                body = json.dumps({
                    "prompt": prompt,
                    "max_tokens": 2000,
                    "temperature": 0.7
                })
            
            # Invoke model
            response = self.bedrock_runtime.invoke_model(
                modelId=model_id,
                body=body,
                contentType="application/json",
                accept="application/json"
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            
            # Extract text based on model format
            if "claude" in model_id.lower():
                text = response_body['content'][0]['text']
            elif "nova" in model_id.lower():
                text = response_body['output']['message']['content'][0]['text']
            else:
                text = response_body.get('completion', response_body.get('output', ''))
            
            # Track usage
            actual_output_tokens = len(text.split()) * 1.3
            model_selector.track_usage(model_id, int(input_tokens), int(actual_output_tokens))
            
            return text
            
        except Exception as e:
            print(f"Error invoking Bedrock: {str(e)}")
            # Return fallback insights
            return self._get_fallback_response()


