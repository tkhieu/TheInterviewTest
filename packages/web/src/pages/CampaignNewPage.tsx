import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton, Input, RecipientTagInput, Textarea } from '@campaign-manager/ui';
import { useCreateCampaignMutation } from '../api.js';

interface FieldErrors {
  name?: string;
  subject?: string;
  body?: string;
  recipient_emails?: string;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function CampaignNewPage() {
  const navigate = useNavigate();
  const [createCampaign, { isLoading, error }] = useCreateCampaignMutation();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const fe: FieldErrors = {};
    if (!name.trim()) fe.name = 'Name is required';
    else if (name.length > 200) fe.name = 'Name must be 200 characters or less';
    if (!subject.trim()) fe.subject = 'Subject is required';
    else if (subject.length > 300) fe.subject = 'Subject must be 300 characters or less';
    if (!body.trim()) fe.body = 'Body is required';
    else if (body.length > 20_000) fe.body = 'Body must be 20,000 characters or less';
    if (recipientEmails.length === 0) {
      fe.recipient_emails = 'At least one recipient is required';
    } else if (recipientEmails.length > 50) {
      fe.recipient_emails = 'Up to 50 recipients allowed';
    } else if (recipientEmails.some((e) => !isEmail(e))) {
      fe.recipient_emails = 'One or more emails are invalid';
    }
    return fe;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fe = validate();
    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;
    try {
      const res = await createCampaign({
        name: name.trim(),
        subject: subject.trim(),
        body,
        recipient_emails: recipientEmails,
      }).unwrap();
      navigate(`/campaigns/${res.id}`, { replace: true });
    } catch {
      // surfaced via `error` below
    }
  };

  const apiErrorMessage = (() => {
    if (!error) return null;
    if ('data' in error && error.data && typeof error.data === 'object' && 'error' in error.data) {
      return (error.data as { error: { message?: string } }).error?.message ?? 'Submit failed';
    }
    return 'Submit failed';
  })();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold tracking-[-0.011em] text-fg mb-6">New campaign</h1>
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!fieldErrors.name}
          helper={fieldErrors.name}
          counter={`${name.length} / 200`}
          required
        />
        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={!!fieldErrors.subject}
          helper={fieldErrors.subject}
          counter={`${subject.length} / 300`}
          required
        />
        <Textarea
          label="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          error={!!fieldErrors.body}
          helper={fieldErrors.body}
          rows={8}
          required
        />
        <div>
          <label className="text-[13px] font-medium text-fg block mb-1.5">Recipients</label>
          <RecipientTagInput
            value={recipientEmails}
            onChange={setRecipientEmails}
            placeholder="paste@emails.here, separated, by, commas"
          />
          {fieldErrors.recipient_emails && (
            <p className="text-[12px] text-rose-600 mt-1.5" role="alert">
              {fieldErrors.recipient_emails}
            </p>
          )}
        </div>
        {apiErrorMessage && (
          <p className="text-[13px] text-rose-600" role="alert">
            {apiErrorMessage}
          </p>
        )}
        <div className="flex items-center justify-end gap-2 pt-2">
          <ActionButton variant="secondary" type="button" onClick={() => navigate('/')}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" loading={isLoading} disabled={isLoading}>
            Create campaign
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
