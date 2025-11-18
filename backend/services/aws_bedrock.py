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
            
            # If no JSON found, raise error - no hardcoded fallbacks
            raise ValueError(f"AI response was not in JSON format. Response: {ai_response[:200]}")
            
        except json.JSONDecodeError as e:
            # If AI fails to return valid JSON, raise error - no hardcoded fallbacks
            raise Exception(f"AI failed to generate valid insights JSON: {str(e)}")
    
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
        
        prompt = f"""Generate 3 hilarious roasts for League of Legends player "{summoner_name}" based on these stats:
- Deaths per game: {death_avg}
- Win Rate: {win_rate:.1f}%  
- KDA: {kda:.2f}
- Recent trend: {trend}

Make the roasts:
- Funny and savage (but playful)
- Use League of Legends terminology and gaming memes
- Include emojis
- Reference their specific stats

Return ONLY a JSON object with this exact structure:
{{"roasts": ["First roast with emoji 😂", "Second roast with emoji 🔥", "Third roast with emoji 💀"]}}

Do not include any other text, explanation, or fields. JUST the JSON."""

        response = await self._invoke_bedrock(prompt, task_type="roast")
        
        # Log response length instead of content (to avoid emoji encoding issues)
        print(f"[ROAST] Received AI response ({len(response)} chars)")
        
        # Clean response (remove markdown code blocks if present)
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            parsed = json.loads(cleaned)
            
            # Validate we got roasts array
            if "roasts" in parsed and isinstance(parsed["roasts"], list) and len(parsed["roasts"]) > 0:
                print(f"[ROAST] Success! Generated {len(parsed['roasts'])} AI roasts")
                return {"roasts": parsed["roasts"]}
            else:
                print(f"[ROAST] Unexpected structure, retrying with simpler prompt")
                # Retry with even simpler request
                simple_prompt = f"""Roast this League player in 3 funny lines:
Win rate: {win_rate:.0f}%, Deaths: {death_avg:.1f}/game, KDA: {kda:.2f}

Just give me 3 funny roasts as a JSON array like this:
{{"roasts": ["roast 1", "roast 2", "roast 3"]}}"""
                
                retry_response = await self._invoke_bedrock(simple_prompt, task_type="roast")
                retry_cleaned = retry_response.strip().replace("```json", "").replace("```", "").strip()
                retry_parsed = json.loads(retry_cleaned)
                
                if "roasts" in retry_parsed and isinstance(retry_parsed["roasts"], list):
                    print(f"[ROAST] Retry successful!")
                    return {"roasts": retry_parsed["roasts"]}
                else:
                    raise ValueError("AI did not return roasts in expected format after retry")
                
        except Exception as e:
            print(f"[ROAST] Error: {str(e)[:100]}")
            # If all else fails, throw a proper error - don't use hardcoded roasts
            raise Exception(f"Failed to generate AI roasts: {str(e)}")
    
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
        
        print(f"[PERSONALITY] Received AI response ({len(response)} chars)")
        
        # Clean response (remove markdown code blocks if present)
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            parsed = json.loads(cleaned)
            print(f"[PERSONALITY] Successfully parsed personality profile")
            return parsed
        except json.JSONDecodeError as e:
            print(f"[PERSONALITY] JSON parse error: {e}")
            # No hardcoded fallbacks - raise error
            raise Exception(f"AI failed to generate valid personality JSON: {str(e)}")
    
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
                # Amazon Nova format - content must be array of objects
                body = json.dumps({
                    "messages": [
                        {
                            "role": "user",
                            "content": [{"text": prompt}]
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
            # Re-raise the error - no hardcoded fallbacks
            raise Exception(f"Bedrock invocation failed: {str(e)}")


