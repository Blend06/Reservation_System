/** Keep in sync with backend `LOGO_MAX_FILE_SIZE` / `BusinessSerializer.validate_logo` */
export const MAX_LOGO_BYTES = 10 * 1024 * 1024;
export const MAX_LOGO_LABEL = '10MB';

export const BUSINESS_TYPES = [
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'salon', label: 'Salon' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'other', label: 'Other' },
];

export const DEFAULT_BUSINESS_FORM = {
  name: '',
  subdomain: '',
  email: '',
  phone: '',
  business_type: 'other',
  business_hours_start: '09:00',
  business_hours_end: '18:00',
  timezone: 'Europe/Berlin',
  email_from_name: '',
  email_from_address: '',
  primary_color: '#3B82F6',
  logo_url: '',
  logo: null,
  subscription_status: 'active',
  subscription_expires: '',
  owner_email: '',
  owner_first_name: '',
  owner_last_name: '',
  owner_password: '',
};
