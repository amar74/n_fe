import { useState } from 'react';
import { X, Mail, Lock, Shield, CheckCircle2, AlertCircle, Copy, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';
import { useRoles } from '@/hooks/useRoles';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

interface ActivateEmployeeModalProps {
  employee: {
    id: string;
    name: string;
    email: string;
    employee_number?: string;
    role?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (data: ActivationData) => Promise<void>;
}

export interface ActivationData {
  employeeId: string;
  sendWelcomeEmail: boolean;
  temporaryPassword: string;
  userRole: string;
  department?: string;
}


const getEmployeeLoginId = (employee: ActivateEmployeeModalProps['employee']) => {
  return employee?.employee_number?.trim() ?? '';
};

const getEmployeeRecordId = (employee: ActivateEmployeeModalProps['employee']) => {
  if (!employee) return '';

  const numberDigits = employee.employee_number?.replace(/\D/g, '') ?? '';
  if (numberDigits.length >= 5) {
    return numberDigits.slice(-6);
  }

  if (employee.id) {
    const hexTail = employee.id.replace(/-/g, '').slice(-6);
    if (hexTail) {
      const decimal = parseInt(hexTail, 16);
      if (!Number.isNaN(decimal)) {
        return decimal.toString().padStart(6, '0').slice(-6);
      }
    }
  }

  return '';
};

export function ActivateEmployeeModal({ employee, isOpen, onClose, onActivate }: ActivateEmployeeModalProps) {
  // Fetch roles and departments from organization settings
  const { allRoles, isLoading: isLoadingRoles } = useRoles();
  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
  } = useQuery({
    queryKey: ['organization', 'departments'],
    queryFn: async () => {
      const response = await apiClient.get('/departments');
      return response.data || [];
    },
  });

  const [userRole, setUserRole] = useState('');
  const [department, setDepartment] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [useQuickActivate, setUseQuickActivate] = useState(false);

  const employeeLoginId = getEmployeeLoginId(employee);
  const employeeRecordId = getEmployeeRecordId(employee);

  const handleCopyEmployeeId = async () => {
    if (!employeeLoginId) {
      toast.error('Employee ID is not available yet.');
      return;
    }

    await copyToClipboard(employeeLoginId);
    toast.success(`Employee ID ${employeeLoginId} copied to clipboard`);
  };

  const handleCopyRecordId = async () => {
    if (!employeeRecordId) {
      toast.error('Employee record ID is not available yet.');
      return;
    }

    await copyToClipboard(employeeRecordId);
    toast.success(`Employee record ID ${employeeRecordId} copied to clipboard`);
  };

  if (!isOpen || !employee) return null;

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemporaryPassword(password);
  };

  // Auto-populate defaults when modal opens
  const handleModalOpen = () => {
    if (!temporaryPassword) {
      generatePassword();
    }
    // Set default role to first available role or empty
    if (!userRole && allRoles.length > 0) {
      setUserRole(allRoles[0].name);
    }
  };

  // Call handleModalOpen when modal opens
  if (isOpen && !temporaryPassword) {
    handleModalOpen();
  }

  const handleActivate = async () => {
    if (!temporaryPassword) {
      toast.error('Please generate or enter a temporary password');
      return;
    }

    setIsActivating(true);
    try {
      await onActivate({
        employeeId: employee.id,
        sendWelcomeEmail: sendEmail,
        temporaryPassword,
        userRole,
        department: department || undefined,
      });
      // Success toast is handled in useEmployeeActivation hook
      onClose();
    } catch (error: any) {
      // Error toast is already handled in useEmployeeActivation hook
      // Just close the modal after a delay to show the error
      setTimeout(() => {
        if (!isActivating) {
          // Modal stays open on error so user can retry
        }
      }, 2000);
    } finally {
      setIsActivating(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#151950] to-[#1e2570] text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Activate Employee Account</h2>
                <p className="text-white/80 text-sm">Create user account for {employee.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Quick Activate Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Quick Activate</p>
                <p className="text-sm text-gray-600">Use smart defaults (recommended)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useQuickActivate}
                onChange={(e) => setUseQuickActivate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {!useQuickActivate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Manual Configuration</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Customize role and permissions for <strong>{employee.email}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {useQuickActivate && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Quick Activate Enabled</p>
                  <p className="text-sm text-green-700 mt-1">
                    Auto-configured role: <strong>{userRole}</strong> • Email will be sent
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Employee Login ID */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Mail className="w-4 h-4" />
              Employee ID (Username)
            </Label>
            <div className="flex gap-3">
              <Input
                type="text"
                value={employeeLoginId}
                placeholder="Will be generated during activation"
                readOnly
                className="flex-1 bg-blue-50 border-blue-300 font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyEmployeeId}
                disabled={!employeeLoginId}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy ID
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              Employees use this ID to log in. Share it along with the temporary password below.
            </p>
          </div>

          {/* Employee Record ID */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <IdCard className="w-4 h-4" />
              Employee Record ID
            </Label>
            <div className="flex gap-3">
              <Input
                type="text"
                value={employeeRecordId}
                placeholder="Will be generated during activation"
                readOnly
                className="flex-1 bg-purple-50 border-purple-300 font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyRecordId}
                disabled={!employeeRecordId}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy ID
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              Internal reference for this employee record. Short 5-6 digit code once the profile is created.
            </p>
          </div>

          {/* Password Generation */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Lock className="w-4 h-4" />
              Temporary Password
            </Label>
            <div className="flex gap-3">
              <Input
                type="text"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                placeholder="Enter or generate password"
                className="flex-1 bg-green-50 border-green-300 font-mono"
                readOnly={useQuickActivate}
              />
              <Button
                onClick={generatePassword}
                variant="outline"
                className="whitespace-nowrap"
                disabled={useQuickActivate}
              >
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              ✅ Auto-generated secure password • User must change on first login
            </p>
          </div>

          {!useQuickActivate && (
            <>
              {/* User Role */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Shield className="w-4 h-4" />
                  User Role
                </Label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#151950] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select role</option>
                  {isLoadingRoles ? (
                    <option>Loading roles...</option>
                  ) : (
                    allRoles.map((role: any) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500">
                  Permissions are automatically assigned based on the selected role.
                </p>
              </div>

              {/* Department */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Shield className="w-4 h-4" />
                  Department
                </Label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#151950] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select department (optional)</option>
                  {isLoadingDepartments ? (
                    <option>Loading departments...</option>
                  ) : (
                    departments.map((dept: any) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </>
          )}

          {/* Email Option */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 text-[#151950] border-gray-300 rounded focus:ring-[#151950]"
            />
            <label htmlFor="sendEmail" className="flex items-center gap-2 cursor-pointer">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                Send welcome email with login credentials
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              onClick={() => setUseQuickActivate(!useQuickActivate)}
              variant="outline"
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              {useQuickActivate ? '⚙️ Customize Settings' : '⚡ Use Quick Activate'}
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isActivating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivate}
                disabled={isActivating || !temporaryPassword}
                className="bg-gradient-to-r from-[#151950] to-[#1e2570] hover:from-[#1e2570] hover:to-[#151950] text-white px-6"
              >
                {isActivating ? 'Activating...' : useQuickActivate ? '⚡ Quick Activate' : '✅ Activate Account'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

