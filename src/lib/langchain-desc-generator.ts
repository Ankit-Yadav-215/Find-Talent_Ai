import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

// Define the structured output schema for job description
const jobDescriptionSchema = z.object({
  jobTitle: z.string().describe('The job title/role'),
  company: z.string().describe('Company name or type'),
  location: z.string().describe('Job location'),
  workType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']).describe('Type of employment'),
  experienceLevel: z.string().describe('Required experience level'),
  salaryRange: z.object({
    min: z.string().describe('Minimum salary'),
    max: z.string().describe('Maximum salary'),
    currency: z.string().describe('Currency code')
  }).optional(),
  jobDescription: z.string().describe('Complete job description with sections'),
  keyResponsibilities: z.array(z.string()).describe('List of key responsibilities'),
  requirements: z.array(z.string()).describe('List of requirements and qualifications'),
  skillsTags: z.array(z.string()).describe('Technical skills and technologies'),
  benefits: z.array(z.string()).describe('Benefits and perks offered'),
  companyDescription: z.string().describe('Brief company description')
});

export type JobDescriptionOutput = z.infer<typeof jobDescriptionSchema>;
function extractJsonFromCodeBlock(text: string): string {
  // Remove code block markers if present
  return text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
}
export class LangChainJobGenerator {
  private llm: ChatOpenAI;
  private parser: StructuredOutputParser<typeof jobDescriptionSchema>;
  private prompt: PromptTemplate;

  constructor() {
    // Initialize OpenAI LLM with server-side API key
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4.1',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create structured output parser
    this.parser = StructuredOutputParser.fromZodSchema(jobDescriptionSchema);

    // Create the prompt template
    this.prompt = PromptTemplate.fromTemplate(`
You are an expert HR professional and job description writer. Create a comprehensive, engaging job description based on the user's requirements.

User Requirements: {userPrompt}

Guidelines:
1. Make the job description professional, engaging, and comprehensive
2. Include all standard sections: About Us, Role Description, Responsibilities, Requirements, Benefits
3. Extract relevant technical skills and create appropriate tags
4. Infer reasonable salary ranges based on role and experience level
5. Create compelling company description if not provided
6. Use industry-standard language and formatting
7. Make it attractive to top talent while being realistic about requirements

{format_instructions}

Generate a complete job description that would attract qualified candidates:
    `);
  }


  async generateJobDescription(userPrompt: string): Promise<JobDescriptionOutput> {
    try {
      // Get format instructions from parser
      const formatInstructions = this.parser.getFormatInstructions();

      // Format the prompt
      const formattedPrompt = await this.prompt.format({
        userPrompt,
        format_instructions: formatInstructions,
      });

      // Generate response using LLM
      const response = await this.llm.invoke(formattedPrompt);

      // Parse the structured output
      const rawContent = response.content as string;
    const cleanContent = extractJsonFromCodeBlock(rawContent);

    const parsedOutput = await this.parser.parse(cleanContent);

    return parsedOutput;
    } catch (error) {
      console.error('Error generating job description:', error);
      throw new Error('Failed to generate job description. Please try again.');
    }
  }

  async refineJobDescription(
    originalDescription: JobDescriptionOutput,
    refinementPrompt: string
  ): Promise<JobDescriptionOutput> {
    try {
      const refinementTemplate = PromptTemplate.fromTemplate(`
You are refining an existing job description based on user feedback.

Original Job Description:
Title: {jobTitle}
Description: {jobDescription}
Requirements: {requirements}
Responsibilities: {responsibilities}

User's Refinement Request: {refinementPrompt}

Please update the job description according to the user's request while maintaining professional quality and structure.

{format_instructions}

Provide the updated job description:
      `);

      const formatInstructions = this.parser.getFormatInstructions();

      const formattedPrompt = await refinementTemplate.format({
        jobTitle: originalDescription.jobTitle,
        jobDescription: originalDescription.jobDescription,
        requirements: originalDescription.requirements.join(', '),
        responsibilities: originalDescription.keyResponsibilities.join(', '),
        refinementPrompt,
        format_instructions: formatInstructions,
      });

      const response = await this.llm.invoke(formattedPrompt);
      const rawContent = response.content as string;
    const cleanContent = extractJsonFromCodeBlock(rawContent);

    const parsedOutput = await this.parser.parse(cleanContent);

    return parsedOutput;
    } catch (error) {
      console.error('Error refining job description:', error);
      throw new Error('Failed to refine job description. Please try again.');
    }
  }

  async extractLinkedInFilters(jobDescription: JobDescriptionOutput): Promise<{
    jobTitles: string[];
    companies: string[];
    locations: string[];
    skills: string[];
    experienceLevels: string[];
  }> {
    try {
      const filterExtractionTemplate = PromptTemplate.fromTemplate(`
Based on this job description, extract relevant LinkedIn search filters that would help find suitable candidates.

Job Title: {jobTitle}
Experience Level: {experienceLevel}
Skills: {skills}
Job Description: {jobDescription}

Extract and suggest:
1. Alternative job titles that candidates might have
2. Types of companies where ideal candidates might currently work
3. Geographic locations to search in
4. Key skills and technologies to filter by
5. Experience/seniority levels to target

Provide specific, actionable filter suggestions that would be available on LinkedIn Sales Navigator.

Format your response as JSON with these keys:
- jobTitles: array of alternative job titles
- companies: array of company types or specific companies
- locations: array of locations
- skills: array of technical skills
- experienceLevels: array of experience levels
      `);

      const formattedPrompt = await filterExtractionTemplate.format({
        jobTitle: jobDescription.jobTitle,
        experienceLevel: jobDescription.experienceLevel,
        skills: jobDescription.skillsTags.join(', '),
        jobDescription: jobDescription.jobDescription,
      });

      const response = await this.llm.invoke(formattedPrompt);
      
      // Parse the JSON response
      const filterSuggestions = JSON.parse(response.content as string);
      
      return filterSuggestions;
    } catch (error) {
      console.error('Error extracting LinkedIn filters:', error);
      // Return default suggestions if parsing fails
      return {
        jobTitles: [jobDescription.jobTitle],
        companies: ['Technology Companies', 'Startups'],
        locations: ['Remote', 'Major Tech Hubs'],
        skills: jobDescription.skillsTags,
        experienceLevels: [jobDescription.experienceLevel],
      };
    }
  }
}

// Singleton instance
let jobGenerator: LangChainJobGenerator | null = null;

export function getJobGenerator(): LangChainJobGenerator {
  if (!jobGenerator) {
    jobGenerator = new LangChainJobGenerator();
  }
  return jobGenerator;
}