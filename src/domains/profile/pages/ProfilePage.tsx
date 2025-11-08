import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useProfile, useUpdateProfile } from '../hooks/useProfile.hooks';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';

export default function ProfilePage() {
  const { t } = useTranslation(['profile', 'common', 'errors']);
  const { user: authUser } = useAuth();
  const toast = useToast();

  // Use TanStack Query hooks
  const profileQuery = useProfile({ enabled: true });
  const updateMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    avatarUrl: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load profile data into form
  useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        firstName: profileQuery.data.first_name || '',
        lastName: profileQuery.data.last_name || '',
        phoneNumber: profileQuery.data.phone_number || '',
        avatarUrl: profileQuery.data.avatar_url || '',
      });
    }
  }, [profileQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      await updateMutation.mutateAsync({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber || undefined,
        avatar_url: formData.avatarUrl || undefined,
      });

      toast.success(t('common:success.updated'));
      setIsEditing(false);
      // TanStack Query auto-invalidates cache, no manual refetch needed
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors:UPDATE_FAILED');
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    // Reset form to profile data
    if (profileQuery.data) {
      setFormData({
        firstName: profileQuery.data.first_name || '',
        lastName: profileQuery.data.last_name || '',
        phoneNumber: profileQuery.data.phone_number || '',
        avatarUrl: profileQuery.data.avatar_url || '',
      });
    }
    setIsEditing(false);
    setFieldErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (profileQuery.isLoading && !profileQuery.data) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  // Use profile data or fallback to auth user
  const displayProfile = profileQuery.data || authUser;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="profile-heading">
          {t('profilePage.title')}
        </h1>
        {!isEditing && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsEditing(true)}
          >
            {t('profilePage.editButton')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          {displayProfile?.avatar_url ? (
            <img
              src={displayProfile.avatar_url}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
              {displayProfile?.first_name?.charAt(0)}{displayProfile?.last_name?.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayProfile?.first_name} {displayProfile?.last_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{displayProfile?.email}</p>
          </div>
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="profile-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                name="firstName"
                label={t('profilePage.fields.firstName')}
                value={formData.firstName}
                onChange={handleChange}
                error={fieldErrors.first_name}
                required
                disabled={updateMutation.isPending}
                data-testid="firstname-input"
              />
              <Input
                type="text"
                name="lastName"
                label={t('profilePage.fields.lastName')}
                value={formData.lastName}
                onChange={handleChange}
                error={fieldErrors.last_name}
                required
                disabled={updateMutation.isPending}
                data-testid="lastname-input"
              />
            </div>

            <Input
              type="tel"
              name="phoneNumber"
              label={t('profilePage.fields.phone')}
              value={formData.phoneNumber}
              onChange={handleChange}
              error={fieldErrors.phone_number}
              placeholder="+1234567890"
              disabled={updateMutation.isPending}
              data-testid="phone-input"
            />

            <Input
              type="url"
              name="avatarUrl"
              label={t('profilePage.fields.avatar')}
              value={formData.avatarUrl}
              onChange={handleChange}
              error={fieldErrors.avatar_url}
              placeholder="https://example.com/avatar.jpg"
              disabled={updateMutation.isPending}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={updateMutation.isPending}
                data-testid="save-button"
              >
                {updateMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('common:saving')}
                  </>
                ) : (
                  t('common:save')
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                {t('common:cancel')}
              </Button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profilePage.fields.firstName')}
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {displayProfile?.first_name || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profilePage.fields.lastName')}
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {displayProfile?.last_name || '-'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('profilePage.fields.email')}
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {displayProfile?.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('profilePage.fields.phone')}
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {displayProfile?.phone_number || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('profilePage.fields.role')}
              </label>
              <div className="flex gap-2">
                {displayProfile?.roles?.map((role: string) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profilePage.fields.status')}
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  (displayProfile && 'status' in displayProfile && displayProfile.status === 'active') || 
                  (displayProfile && 'is_active' in displayProfile && displayProfile.is_active)
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}>
                  {(displayProfile && 'status' in displayProfile && displayProfile.status === 'active') || 
                   (displayProfile && 'is_active' in displayProfile && displayProfile.is_active)
                    ? t('profilePage.status.active') 
                    : t('profilePage.status.inactive')}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profilePage.fields.emailVerified')}
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  displayProfile?.is_verified
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {displayProfile?.is_verified ? t('profilePage.status.verified') : t('profilePage.status.notVerified')}
                </span>
              </div>
            </div>

            {displayProfile?.created_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profilePage.fields.memberSince')}
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(displayProfile.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
