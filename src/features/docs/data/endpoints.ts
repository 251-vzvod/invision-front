import type { Endpoint, EndpointGroup } from '../types'

export const endpoints: Endpoint[] = [
  // ─── Application Forms ───
  {
    id: 'create-application-form',
    method: 'POST',
    path: '/api/v1/forms',
    summary: 'Create application form',
    description:
      'Creates a new application form for a candidate. Requires program, personal information, contact information, education, and motivation sections.',
    tag: 'Application Forms',
    pathParams: [],
    queryParams: [],
    requestBody: JSON.stringify(
      {
        program: {
          level: 'undergraduate',
          faculty_id: 'tech',
          speciality_id: 12,
          display_label: 'BSc Computer Science',
        },
        personal_information: {
          first_name: 'Aruzhan',
          last_name: 'Nurgalieva',
          patronymic: 'Serikovna',
          birth_date: '14.05.2007',
          gender: 'FEMALE',
          citizenship: 'Kazakhstan',
        },
        contact_information: {
          contacts: {
            phone: '+77011234567',
            whatsapp: '+77011234567',
            instagram: 'aruzhan.student',
            telegram: 'aruzhan_tg',
          },
        },
        education: {
          english_proficiency: { type: 'ielts', score: 6.5 },
          school_certificate: { type: 'unt', score: 110 },
        },
        motivation: {
          presentation_link: 'https://storage.example.com/presentation.mp4',
          motivation_letter: 'https://storage.example.com/motivation-letter.pdf',
        },
      },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        id: 123,
        created_at: '2026-03-29T10:15:00Z',
        updated_at: '2026-03-29T10:15:00Z',
        status: 'in_review',
        program: { level: 'undergraduate', faculty_id: 'tech' },
        personal_information: {
          first_name: 'Aruzhan',
          last_name: 'Nurgalieva',
          patronymic: 'Serikovna',
          birth_date: '14.05.2007',
          gender: 'FEMALE',
          citizenship: 'Kazakhstan',
        },
        contact_information: {
          contacts: {
            phone: '+77011234567',
            whatsapp: '+77011234567',
            instagram: 'aruzhan.student',
            telegram: 'aruzhan_tg',
          },
        },
        education: {
          english_proficiency: { type: 'ielts', score: 6.5 },
          school_certificate: { type: 'unt', score: 110 },
        },
        motivation: {
          presentation: {
            link: 'https://storage.example.com/presentation.mp4',
            status: 'completed',
            text: 'Transcript extracted from the presentation.',
          },
          motivation_letter: {
            link: 'https://storage.example.com/motivation-letter.pdf',
            status: 'completed',
            text: 'Extracted text from the motivation letter.',
          },
        },
        personal_data_consent: true,
      },
      null,
      2,
    ),
  },
  {
    id: 'list-application-forms',
    method: 'GET',
    path: '/api/v1/forms',
    summary: 'List application forms',
    description:
      'Returns a paginated list of all application forms. Supports page and size query parameters.',
    tag: 'Application Forms',
    pathParams: [],
    queryParams: [
      {
        name: 'page',
        type: 'integer',
        description: 'Page number (starts at 1)',
        required: false,
        default: 1,
      },
      {
        name: 'size',
        type: 'integer',
        description: 'Number of items per page (1-100)',
        required: false,
        default: 10,
      },
    ],
    requestBody: null,
    responseExample: JSON.stringify(
      [
        {
          id: 123,
          created_at: '2026-03-29T10:15:00Z',
          updated_at: '2026-03-29T10:20:00Z',
          status: 'in_review',
          program: { level: 'undergraduate', faculty_id: 'tech' },
          personal_information: {
            first_name: 'Aruzhan',
            last_name: 'Nurgalieva',
            patronymic: 'Serikovna',
            birth_date: '14.05.2007',
            gender: 'FEMALE',
            citizenship: 'Kazakhstan',
          },
          contact_information: {
            contacts: {
              phone: '+77011234567',
              whatsapp: '+77011234567',
              instagram: 'aruzhan.student',
              telegram: 'aruzhan_tg',
            },
          },
          education: {
            english_proficiency: { type: 'ielts', score: 6.5 },
            school_certificate: { type: 'unt', score: 110 },
          },
          motivation: {
            presentation: {
              link: 'https://storage.example.com/presentation.mp4',
              status: 'completed',
              text: 'Transcript extracted from the presentation.',
            },
            motivation_letter: {
              link: 'https://storage.example.com/motivation-letter.pdf',
              status: 'completed',
              text: 'Extracted text from the motivation letter.',
            },
          },
          personal_data_consent: true,
        },
      ],
      null,
      2,
    ),
  },
  {
    id: 'get-application-form',
    method: 'GET',
    path: '/api/v1/forms/{application_form_id}',
    summary: 'Get application form',
    description: 'Returns a single application form by its ID.',
    tag: 'Application Forms',
    pathParams: [
      {
        name: 'application_form_id',
        type: 'integer',
        description: 'Unique identifier of the application form',
        required: true,
      },
    ],
    queryParams: [],
    requestBody: null,
    responseExample: JSON.stringify(
      {
        id: 123,
        created_at: '2026-03-29T10:15:00Z',
        updated_at: '2026-03-29T10:20:00Z',
        status: 'in_review',
        program: { level: 'undergraduate', faculty_id: 'tech' },
        personal_information: {
          first_name: 'Aruzhan',
          last_name: 'Nurgalieva',
          patronymic: 'Serikovna',
          birth_date: '14.05.2007',
          gender: 'FEMALE',
          citizenship: 'Kazakhstan',
        },
        contact_information: {
          contacts: {
            phone: '+77011234567',
            whatsapp: '+77011234567',
            instagram: 'aruzhan.student',
            telegram: 'aruzhan_tg',
          },
        },
        education: {
          english_proficiency: { type: 'ielts', score: 6.5 },
          school_certificate: { type: 'unt', score: 110 },
        },
        motivation: {
          presentation: {
            link: 'https://storage.example.com/presentation.mp4',
            status: 'completed',
            text: 'Transcript extracted from the presentation.',
          },
          motivation_letter: {
            link: 'https://storage.example.com/motivation-letter.pdf',
            status: 'completed',
            text: 'Extracted text from the motivation letter.',
          },
        },
        personal_data_consent: true,
      },
      null,
      2,
    ),
  },
  {
    id: 'update-application-form',
    method: 'PUT',
    path: '/api/v1/forms/{application_form_id}',
    summary: 'Update application form',
    description: 'Updates an existing application form. All fields are required in the request body.',
    tag: 'Application Forms',
    pathParams: [
      {
        name: 'application_form_id',
        type: 'integer',
        description: 'Unique identifier of the application form',
        required: true,
      },
    ],
    queryParams: [],
    requestBody: JSON.stringify(
      {
        program: {
          level: 'undergraduate',
          faculty_id: 'tech',
          speciality_id: 12,
          display_label: 'BSc Computer Science',
        },
        personal_information: {
          first_name: 'Aruzhan',
          last_name: 'Nurgalieva',
          patronymic: 'Serikovna',
          birth_date: '14.05.2007',
          gender: 'FEMALE',
          citizenship: 'Kazakhstan',
        },
        contact_information: {
          contacts: {
            phone: '+77011234567',
            whatsapp: '+77011234567',
            instagram: 'aruzhan.student',
            telegram: 'aruzhan_tg',
          },
        },
        education: {
          english_proficiency: { type: 'ielts', score: 6.5 },
          school_certificate: { type: 'unt', score: 110 },
        },
        motivation: {
          presentation_link: 'https://storage.example.com/presentation.mp4',
          motivation_letter: 'https://storage.example.com/motivation-letter.pdf',
        },
      },
      null,
      2,
    ),
    responseExample: JSON.stringify({ detail: 'No Content' }, null, 2),
  },
  {
    id: 'delete-application-form',
    method: 'DELETE',
    path: '/api/v1/forms/{application_form_id}',
    summary: 'Delete application form',
    description: 'Permanently deletes an application form by its ID.',
    tag: 'Application Forms',
    pathParams: [
      {
        name: 'application_form_id',
        type: 'integer',
        description: 'Unique identifier of the application form',
        required: true,
      },
    ],
    queryParams: [],
    requestBody: null,
    responseExample: JSON.stringify({ detail: 'No Content' }, null, 2),
  },

  // ─── S3 Storage ───
  {
    id: 'upload-file',
    method: 'POST',
    path: '/api/v1/s3/upload',
    summary: 'Upload a file to S3',
    description:
      'Uploads a single file to the configured S3 bucket and returns the uploaded file URL. Intended for applicant attachments such as motivation letters.',
    tag: 'S3 Storage',
    pathParams: [],
    queryParams: [],
    contentType: 'multipart/form-data',
    requestBody: JSON.stringify(
      {
        file: '(binary file data)',
      },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        url: 'https://example-bucket.s3.us-east-1.amazonaws.com/uploads/file.pdf',
        filename: 'motivation-letter.pdf',
      },
      null,
      2,
    ),
  },
  {
    id: 'delete-file',
    method: 'DELETE',
    path: '/api/v1/s3/delete',
    summary: 'Delete a file from S3',
    description: 'Deletes a single file from the configured S3 bucket by its public storage URL.',
    tag: 'S3 Storage',
    pathParams: [],
    queryParams: [],
    requestBody: JSON.stringify(
      {
        url: 'https://example-bucket.s3.us-east-1.amazonaws.com/uploads/file.pdf',
      },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        detail: 'File deleted successfully.',
      },
      null,
      2,
    ),
  },

  // ─── Agent ───
  {
    id: 'agent-reply',
    method: 'POST',
    path: '/api/v1/agent/reply',
    summary: 'Agent Reply',
    description:
      'Sends a message to the AI agent and receives a reply. Returns the next message and a status flag. When status is "ready" the interview is complete.',
    tag: 'Agent',
    pathParams: [],
    queryParams: [],
    requestBody: JSON.stringify(
      {
        text: 'Tell me about your leadership experience.',
        applicant_external_id: 123,
      },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        message: 'Can you describe a specific problem you solved in your community?',
        status: 'not_ready',
      },
      null,
      2,
    ),
  },
  {
    id: 'save-applicant-info',
    method: 'POST',
    path: '/api/v1/agent/applicant-info',
    summary: 'Save Applicant Info',
    description:
      'Saves or updates applicant information including personal details, motivation, and education data for the AI agent context.',
    tag: 'Agent',
    pathParams: [],
    queryParams: [],
    requestBody: JSON.stringify(
      {
        external_id: 123,
        personal_info: {
          first_name: 'Aruzhan',
          last_name: 'Nurgalieva',
          patronymic: 'Serikovna',
          gender: 'female',
        },
        motivation: {
          motivation_letter: 'I want to change the world through technology...',
          presentation_text: 'My presentation transcript...',
        },
        education: {
          english_proficiency: { type: 'ielts', score: 6.5 },
          school_certificate: { type: 'unt', score: 110 },
        },
      },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        id: 1,
        created_at: '2026-03-29T10:15:00Z',
        updated_at: '2026-03-29T10:15:00Z',
        external_id: 123,
        personal_info: {
          first_name: 'Aruzhan',
          last_name: 'Nurgalieva',
          patronymic: 'Serikovna',
          gender: 'female',
        },
        motivation: {
          motivation_letter: 'I want to change the world through technology...',
          presentation_text: 'My presentation transcript...',
        },
        education: {
          english_proficiency: { type: 'ielts', score: 6.5 },
          school_certificate: { type: 'unt', score: 110 },
        },
      },
      null,
      2,
    ),
  },
  {
    id: 'get-questions',
    method: 'GET',
    path: '/api/v1/agent/questions/{external_id}',
    summary: 'Get Questions By External ID',
    description:
      'Retrieves all questions and answers recorded for a specific applicant by their external ID.',
    tag: 'Agent',
    pathParams: [
      {
        name: 'external_id',
        type: 'integer',
        description: 'External identifier of the applicant (must be > 0)',
        required: true,
      },
    ],
    queryParams: [],
    requestBody: null,
    responseExample: JSON.stringify(
      [
        {
          id: 1,
          created_at: '2026-03-29T10:15:00Z',
          updated_at: '2026-03-29T10:15:00Z',
          external_id: 123,
          question: 'Can you describe a time you led a team?',
          answer: 'I organized a volunteer group of 20 students for a community project...',
        },
        {
          id: 2,
          created_at: '2026-03-29T10:16:00Z',
          updated_at: '2026-03-29T10:16:00Z',
          external_id: 123,
          question: 'What motivates you to apply to inVision U?',
          answer: 'I believe in the power of technology to transform communities...',
        },
      ],
      null,
      2,
    ),
  },

  // ─── ML Scoring Service ───
  {
    id: 'ml-score-candidate',
    method: 'POST',
    path: '/score',
    summary: 'Score Candidate',
    description:
      'Scores a single candidate using deterministic feature extraction, semantic rubric matching, and optional LLM explainability. Returns merit score, confidence, authenticity risk, evidence highlights, and committee-facing explanation.',
    tag: 'ML Scoring Service',
    baseUrlOverride: 'https://admissions-ml-service-production.up.railway.app',
    pathParams: [],
    queryParams: [],
    requestBody: JSON.stringify(
      {
        candidate_id: 'cand_001',
        structured_data: {
          education: {
            english_proficiency: { type: 'ielts', score: 6.5 },
            school_certificate: { type: 'unt', score: 110 },
          },
        },
        text_inputs: {
          motivation_letter_text: 'I want to build products that solve transport problems in my city...',
          motivation_questions: [
            {
              question: 'Why do you want to study at inVision U?',
              answer: 'I believe in the mission of building future leaders...',
            },
          ],
          interview_text: 'The student demonstrated strong motivation and clear goals...',
          video_interview_transcript_text: null,
          video_presentation_transcript_text: null,
        },
        behavioral_signals: {
          completion_rate: 0.95,
          returned_to_edit: true,
          skipped_optional_questions: 0,
          meaningful_answers_count: 12,
          scenario_depth: 0.7,
        },
        metadata: {
          source: 'web_form',
          submitted_at: '2026-03-29T10:15:00Z',
          scoring_version: 'v1.4.0',
        },
      },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        candidate_id: 'cand_001',
        scoring_run_id: 'run_20260329_001',
        scoring_version: 'v1.4.0',
        eligibility_status: 'eligible',
        eligibility_reasons: [],
        merit_score: 74,
        confidence_score: 61,
        authenticity_risk: 43,
        ai_probability_ai_generated: 0.31,
        text_ai_probabilities: {
          motivation_letter_text: {
            source_key: 'motivation_letter_text',
            source_label: 'Motivation letter',
            applicable: true,
            probability_ai_generated: 0.38,
            note: null,
            question: null,
          },
          interview_text: {
            source_key: 'interview_text',
            source_label: 'Interview transcript',
            applicable: true,
            probability_ai_generated: 0.22,
            note: null,
            question: null,
          },
          video_interview_transcript_text: null,
          video_presentation_transcript_text: null,
          motivation_questions: [
            {
              source_key: 'motivation_question_0',
              source_label: 'Motivation question 1',
              applicable: true,
              probability_ai_generated: 0.29,
              note: null,
              question: 'Why do you want to study at inVision U?',
            },
          ],
        },
        recommendation: 'manual_review_required',
        review_flags: ['low_evidence_density', 'moderate_authenticity_risk'],
        hidden_potential_score: 58,
        support_needed_score: 42,
        shortlist_priority_score: 65,
        evidence_coverage_score: 44,
        trajectory_score: 79,
        committee_cohorts: ['Moderate evidence density', 'Authenticity review needed'],
        why_candidate_surfaced: [],
        what_to_verify_manually: [
          'Ask for concrete examples of the peer study group outcomes.',
        ],
        suggested_follow_up_question:
          'Can you describe a specific problem you solved in your study group?',
        evidence_highlights: [
          {
            claim: 'Started a peer study group',
            support_level: 'weak',
            source: 'motivation_questions',
            snippet: 'I started a peer study group and organized weekly sessions...',
            support_score: 4,
            rationale: 'Claim is present but no measurable outcomes reported.',
          },
        ],
        top_strengths: [
          'Clear motivation linked to the chosen program',
          'Visible growth trajectory over time',
        ],
        main_gaps: ['Impact evidence is still limited'],
        explanation: {
          summary:
            'Candidate shows strong motivation and growth potential, but confidence is moderate.',
          scoring_notes: {
            potential: 'High — clear signs of self-driven learning.',
            motivation: 'High — goals are specific and connected to prior experience.',
            confidence: 'Moderate — evidence density is uneven.',
            authenticity_risk: 'Moderate — some claims are under-supported.',
            recommendation: 'Manual review required due to evidence gaps.',
          },
        },
      },
      null,
      2,
    ),
  },
  {
    id: 'ml-rank-batch',
    method: 'POST',
    path: '/rank',
    summary: 'Rank Batch',
    description:
      'Scores and ranks a batch of candidates. Returns ranked list with shortlist/hidden-potential/support-needed cohorts. Optional top_k parameter limits results.',
    tag: 'ML Scoring Service',
    baseUrlOverride: 'https://admissions-ml-service-production.up.railway.app',
    pathParams: [],
    queryParams: [
      {
        name: 'top_k',
        type: 'integer',
        description: 'Return only top K candidates (optional)',
        required: false,
      },
    ],
    requestBody: JSON.stringify(
      {
        candidates: [
          {
            candidate_id: 'cand_001',
            structured_data: {
              education: {
                english_proficiency: { type: 'ielts', score: 6.5 },
                school_certificate: { type: 'unt', score: 110 },
              },
            },
            text_inputs: {
              motivation_letter_text: 'I want to build products...',
              motivation_questions: [],
              interview_text: null,
              video_interview_transcript_text: null,
              video_presentation_transcript_text: null,
            },
          },
          {
            candidate_id: 'cand_002',
            structured_data: {
              education: {
                english_proficiency: { type: 'toefl', score: 95 },
                school_certificate: { type: 'unt', score: 125 },
              },
            },
            text_inputs: {
              motivation_letter_text: 'Led a campus initiative that reduced waste by 25%...',
              motivation_questions: [],
              interview_text: null,
              video_interview_transcript_text: null,
              video_presentation_transcript_text: null,
            },
          },
        ],
      },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        scoring_run_id: 'run_20260329_rank',
        scoring_version: 'v1.4.0',
        count: 2,
        returned_count: 2,
        ranked_candidate_ids: ['cand_002', 'cand_001'],
        ranked_candidates: [
          {
            candidate_id: 'cand_002',
            rank_position: 1,
            recommendation: 'standard_review',
            merit_score: 88,
            confidence_score: 79,
            authenticity_risk: 28,
            ai_probability_ai_generated: 0.07,
            shortlist_priority_score: 88,
            hidden_potential_score: 65,
            support_needed_score: 20,
            evidence_coverage_score: 83,
            trajectory_score: 81,
            is_shortlist_candidate: true,
            is_hidden_potential_candidate: false,
            is_support_needed_candidate: false,
            is_authenticity_review_candidate: false,
          },
          {
            candidate_id: 'cand_001',
            rank_position: 2,
            recommendation: 'manual_review_required',
            merit_score: 74,
            confidence_score: 61,
            authenticity_risk: 43,
            ai_probability_ai_generated: 0.31,
            shortlist_priority_score: 65,
            hidden_potential_score: 58,
            support_needed_score: 42,
            evidence_coverage_score: 44,
            trajectory_score: 79,
            is_shortlist_candidate: false,
            is_hidden_potential_candidate: true,
            is_support_needed_candidate: false,
            is_authenticity_review_candidate: true,
          },
        ],
        shortlist_candidate_ids: ['cand_002'],
        hidden_potential_candidate_ids: ['cand_001'],
        support_needed_candidate_ids: [],
        authenticity_review_candidate_ids: ['cand_001'],
        ranker_metadata: {},
      },
      null,
      2,
    ),
  },

  // ─── ML Assessments ───
  {
    id: 'list-ml-assessments',
    method: 'GET',
    path: '/api/v1/ml-assessments',
    summary: 'List latest ML assessments',
    description:
      'Returns a paginated list of the latest ML assessments for all applicants. Supports sorting, filtering by recommendation, eligibility, and decision. Comma-separate multiple values for multi-filter (e.g. recommendation=review_priority,standard_review).',
    tag: 'ML Assessments',
    pathParams: [],
    queryParams: [
      { name: 'page', type: 'integer', description: 'Page number (starts at 1)', required: false, default: 1 },
      { name: 'size', type: 'integer', description: 'Items per page (1–100)', required: false, default: 10 },
      { name: 'sort', type: 'string', description: 'Sort order by merit score: ASC or DESC', required: false, default: 'DESC' },
      { name: 'recommendation', type: 'string', description: 'Filter by recommendation value(s), comma-separated', required: false },
      { name: 'eligibility', type: 'string', description: 'Filter by eligibility status, comma-separated', required: false },
      { name: 'decision', type: 'string', description: 'Filter by committee decision, comma-separated', required: false },
    ],
    requestBody: null,
    responseExample: JSON.stringify(
      {
        items: [
          {
            candidate_id: 1,
            first_name: 'Madi',
            last_name: 'Aslan',
            full_name: 'Madi Aslan',
            program: 'tech',
            application_status: 'chat',
            decision: 'no_decision',
            eligibility_status: 'eligible',
            recommendation: 'review_priority',
            merit_score: 64,
            confidence_score: 60,
            authenticity_risk: 44,
            ai_probability_ai_generated: 0.14,
            hidden_potential_score: 57,
            support_needed_score: 54,
            shortlist_priority_score: 68,
            evidence_coverage_score: 79,
            trajectory_score: 73,
          },
        ],
        page: 1,
        size: 10,
        total: 3,
        total_pages: 1,
      },
      null,
      2,
    ),
  },
  {
    id: 'get-ml-assessment',
    method: 'GET',
    path: '/api/v1/forms/{application_form_id}/ml-assessment',
    summary: 'Get ML assessment for application form',
    description:
      'Returns the latest ML assessment for a specific application form, including full scoring breakdown, evidence highlights, top strengths, main gaps, and explainability notes.',
    tag: 'ML Assessments',
    pathParams: [
      { name: 'application_form_id', type: 'integer', description: 'Unique identifier of the application form', required: true },
    ],
    queryParams: [],
    requestBody: null,
    responseExample: JSON.stringify(
      {
        id: 1,
        created_at: '2026-04-02T08:20:00Z',
        updated_at: '2026-04-02T08:20:00Z',
        candidate_id: 1,
        scoring_run_id: 'run_20260402081703_d3fba766',
        scoring_version: 'v1.4.0',
        eligibility_status: 'eligible',
        eligibility_reasons: [],
        merit_score: 64,
        confidence_score: 60,
        authenticity_risk: 44,
        ai_probability_ai_generated: 0.14,
        text_ai_probabilities: {
          motivation_letter_text: {
            source_key: 'motivation_letter_text',
            source_label: 'Motivation letter',
            applicable: true,
            probability_ai_generated: 0.18,
            note: null,
            question: null,
          },
          interview_text: {
            source_key: 'interview_text',
            source_label: 'Interview transcript',
            applicable: true,
            probability_ai_generated: 0.09,
            note: null,
            question: null,
          },
          video_interview_transcript_text: null,
          video_presentation_transcript_text: null,
          motivation_questions: [
            {
              source_key: 'motivation_question_0',
              source_label: 'Motivation question 1',
              applicable: true,
              probability_ai_generated: 0.11,
              note: null,
              question: 'Why do you want to study at inVision U?',
            },
          ],
        },
        recommendation: 'review_priority',
        review_flags: ['contradiction_risk', 'possible_contradiction'],
        hidden_potential_score: 57,
        support_needed_score: 54,
        shortlist_priority_score: 68,
        evidence_coverage_score: 79,
        trajectory_score: 73,
        committee_cohorts: ['High priority'],
        why_candidate_surfaced: ['Strong growth trajectory.'],
        what_to_verify_manually: ['Verify that key claims stay consistent.'],
        suggested_follow_up_question: 'Describe a specific small problem you want to solve.',
        evidence_highlights: [
          {
            claim: 'Candidate shows early leadership and responsibility.',
            support_level: 'strong',
            source: 'motivation_questions',
            snippet: 'I stood up and told them to stop.',
            support_score: 69,
            rationale: 'Supported by concrete action and coordination signals.',
          },
        ],
        top_strengths: ['Demonstrates strong responsibility and initiative.'],
        main_gaps: ['Lacks formal leadership experience.'],
        explanation: {
          summary: 'Routing recommendation: review_priority.',
          scoring_notes: {
            potential: 'Potential axis reflects growth and resilience.',
            motivation: 'Motivation axis combines clarity and fit.',
            confidence: 'Confidence reflects reliability of the assessment.',
            authenticity_risk: 'Risk is a review-risk signal.',
            recommendation: 'Recommendation is a routing label.',
          },
        },
      },
      null,
      2,
    ),
  },

  // ─── Rankings ───
  {
    id: 'start-ranking',
    method: 'POST',
    path: '/api/v1/rankings',
    summary: 'Start a batch ranking run',
    description:
      'Triggers an async ML ranking pipeline for the given candidate IDs. Returns a ranking_id to poll for status. Use GET /api/v1/rankings/{ranking_id} to track progress.',
    tag: 'Rankings',
    pathParams: [],
    queryParams: [],
    requestBody: JSON.stringify(
      { candidate_ids: [1, 2, 3], top_k: 3 },
      null,
      2,
    ),
    responseExample: JSON.stringify(
      {
        ranking_id: 1,
        status: 'pending',
        candidate_ids: [1, 2, 3],
        top_k: 3,
        celery_task_id: 'f2f6f4b7-6dd0-4f5e-8b12-1d9a15f5c220',
      },
      null,
      2,
    ),
  },
  {
    id: 'get-ranking',
    method: 'GET',
    path: '/api/v1/rankings/{ranking_id}',
    summary: 'Get ranking run status and result',
    description:
      'Returns the current status and result of a ranking run. Poll this endpoint until status is "completed" or "failed". Possible statuses: pending, processing, completed, failed.',
    tag: 'Rankings',
    pathParams: [
      { name: 'ranking_id', type: 'integer', description: 'Unique identifier of the ranking run', required: true },
    ],
    queryParams: [],
    requestBody: null,
    responseExample: JSON.stringify(
      {
        id: 1,
        created_at: '2026-04-02T08:00:00Z',
        updated_at: '2026-04-02T08:01:00Z',
        status: 'completed',
        candidate_ids: [1, 2, 3],
        top_k: 3,
        celery_task_id: 'f2f6f4b7-6dd0-4f5e-8b12-1d9a15f5c220',
        scoring_run_id: 'run_20260402080103_abc123',
        scoring_version: 'v1.4.0',
        count: 3,
        returned_count: 3,
        ranked_candidate_ids: [2, 1, 3],
        shortlist_candidate_ids: [2],
        hidden_potential_candidate_ids: [1],
        support_needed_candidate_ids: [],
        authenticity_review_candidate_ids: [3],
        ranker_metadata: {},
        error_message: null,
        items: [
          {
            candidate_id: 2,
            rank_position: 1,
            recommendation: 'review_priority',
            merit_score: 78,
            confidence_score: 72,
            authenticity_risk: 20,
            ai_probability_ai_generated: 0.09,
            shortlist_priority_score: 85,
            hidden_potential_score: 60,
            support_needed_score: 30,
            evidence_coverage_score: 80,
            trajectory_score: 75,
            is_shortlist_candidate: true,
            is_hidden_potential_candidate: false,
            is_support_needed_candidate: false,
            is_authenticity_review_candidate: false,
          },
        ],
        raw_response: {},
      },
      null,
      2,
    ),
  },

  // ─── Health ───
  {
    id: 'health-check',
    method: 'GET',
    path: '/api/health',
    summary: 'Health Check',
    description: 'Returns the health status of the API. Use this to verify the server is running.',
    tag: 'Health',
    pathParams: [],
    queryParams: [],
    requestBody: null,
    responseExample: JSON.stringify({ status: 'ok' }, null, 2),
  },
]

export const endpointGroups: EndpointGroup[] = [
  {
    tag: 'ML Scoring Service',
    description:
      'Explainable scoring service: deterministic feature extraction, semantic rubric matching, and LLM explainability. Base URL: https://admissions-ml-service-production.up.railway.app',
    endpoints: endpoints.filter((e) => e.tag === 'ML Scoring Service'),
  },
  {
    tag: 'Application Forms',
    description: 'CRUD operations for managing candidate application forms.',
    endpoints: endpoints.filter((e) => e.tag === 'Application Forms'),
  },
  {
    tag: 'S3 Storage',
    description: 'Upload and delete files from S3 storage.',
    endpoints: endpoints.filter((e) => e.tag === 'S3 Storage'),
  },
  {
    tag: 'ML Assessments',
    description: 'Retrieve ML-scored assessment results for candidates. Includes full scoring breakdown, evidence highlights, and explainability data.',
    endpoints: endpoints.filter((e) => e.tag === 'ML Assessments'),
  },
  {
    tag: 'Rankings',
    description: 'Async batch ranking pipeline. Start a ranking run, then poll for results until status is "completed".',
    endpoints: endpoints.filter((e) => e.tag === 'Rankings'),
  },
  {
    tag: 'Agent',
    description: 'AI agent for evaluating applicants through conversational assessment.',
    endpoints: endpoints.filter((e) => e.tag === 'Agent'),
  },
  {
    tag: 'Health',
    description: 'Server health monitoring.',
    endpoints: endpoints.filter((e) => e.tag === 'Health'),
  },
]
