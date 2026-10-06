import type { EmailTemplate } from './template-types';

type StarterTemplate = Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Ready-made templates offered from the picker's empty state, so a new
 * account has something to choose from. They are added to the user's own
 * library on request and are ordinary templates from then on - editable and
 * deletable like any other. Content is English only.
 */
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    name: 'Meeting request',
    category: 'Work',
    subject: 'Meeting request',
    body:
      'Hi {{recipient_name}},\n\n' +
      'I would like to set up a time to talk. Would any of the following work for you?\n\n' +
      '- \n- \n\n' +
      'If none of these suit, let me know what does and I will work around it.\n\n' +
      'Best regards,\n{{sender_name}}',
    isFavorite: false,
  },
  {
    name: 'Follow-up',
    category: 'Work',
    subject: 'Following up',
    body:
      'Hi {{recipient_name}},\n\n' +
      'I wanted to follow up on my previous message. Have you had a chance to look at it?\n\n' +
      'Happy to answer any questions.\n\n' +
      'Best regards,\n{{sender_name}}',
    isFavorite: false,
  },
  {
    name: 'Thank you',
    category: 'Work',
    subject: 'Thank you',
    body:
      'Hi {{recipient_name}},\n\n' +
      'Thank you for your time today. I appreciate it.\n\n' +
      'Best regards,\n{{sender_name}}',
    isFavorite: false,
  },
  {
    name: 'Introduction',
    category: 'Work',
    subject: 'Introduction',
    body:
      'Hi {{recipient_name}},\n\n' +
      'My name is {{sender_name}} and I am reaching out from {{company}}.\n\n' +
      'I would welcome the chance to introduce myself and learn more about what you are working on.\n\n' +
      'Best regards,\n{{sender_name}}',
    isFavorite: false,
  },
];
