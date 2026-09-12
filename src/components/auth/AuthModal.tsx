import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {
  useAuth,
  useClerk,
  useOrganization,
  useOrganizationList,
  useSSO,
  useUser,
} from '@clerk/expo';
import { colors, fonts, headlineStyle } from '../../theme/theme';

WebBrowser.maybeCompleteAuthSession();

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

function OrgSection() {
  const { organization } = useOrganization();
  const {
    userMemberships,
    isLoaded: isOrgListLoaded,
    setActive: setActiveOrg,
    createOrganization,
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [orgLoading, setOrgLoading] = useState(false);

  const handleSwitchOrg = async (orgId: string | null) => {
    if (!setActiveOrg) return;
    try {
      setOrgLoading(true);
      await setActiveOrg({ organization: orgId });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to switch organization.');
    } finally {
      setOrgLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!createOrganization || !newOrgName.trim()) return;
    try {
      setOrgLoading(true);
      const newOrg = await createOrganization({ name: newOrgName.trim() });
      if (setActiveOrg && newOrg?.id) {
        await setActiveOrg({ organization: newOrg.id });
      }
      setIsCreatingOrg(false);
      setNewOrgName('');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create organization.');
    } finally {
      setOrgLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="business-outline" size={20} color={colors.ink} />
        <Text style={styles.cardTitle}>Active Organization</Text>
      </View>

      <View style={styles.orgActiveBox}>
        <Text style={styles.orgActiveName}>
          {organization?.name || 'Personal Workspace (No Org)'}
        </Text>
        {organization?.slug && (
          <Text style={styles.orgActiveSlug}>slug: {organization.slug}</Text>
        )}
      </View>

      {/* Organization Switcher List */}
      {isOrgListLoaded && userMemberships?.data && userMemberships.data.length > 0 && (
        <View style={styles.orgList}>
          <Text style={styles.sectionSubtitle}>Switch Organization</Text>
          <TouchableOpacity
            style={[
              styles.orgItem,
              !organization && styles.orgItemActive,
            ]}
            onPress={() => handleSwitchOrg(null)}
            disabled={orgLoading}
          >
            <Ionicons name="person" size={16} color={!organization ? colors.coral : colors.clay} />
            <Text style={[styles.orgItemText, !organization && styles.orgItemTextActive]}>
              Personal Account
            </Text>
            {!organization && <Ionicons name="checkmark" size={16} color={colors.coral} />}
          </TouchableOpacity>

          {userMemberships.data.map((mem) => {
            const isCurrent = organization?.id === mem.organization.id;
            return (
              <TouchableOpacity
                key={mem.id}
                style={[
                  styles.orgItem,
                  isCurrent && styles.orgItemActive,
                ]}
                onPress={() => handleSwitchOrg(mem.organization.id)}
                disabled={orgLoading}
              >
                <Ionicons name="business" size={16} color={isCurrent ? colors.coral : colors.clay} />
                <Text style={[styles.orgItemText, isCurrent && styles.orgItemTextActive]}>
                  {mem.organization.name}
                </Text>
                {isCurrent && <Ionicons name="checkmark" size={16} color={colors.coral} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Create New Organization */}
      {isCreatingOrg ? (
        <View style={styles.createOrgBox}>
          <TextInput
            style={styles.input}
            placeholder="Organization Name (e.g. Acme Corp)"
            placeholderTextColor={colors.clay}
            value={newOrgName}
            onChangeText={setNewOrgName}
            autoFocus
          />
          <View style={styles.createOrgActions}>
            <TouchableOpacity
              style={[styles.smallButton, styles.cancelButton]}
              onPress={() => setIsCreatingOrg(false)}
            >
              <Text style={styles.smallButtonTextDark}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, styles.confirmButton]}
              onPress={handleCreateOrg}
              disabled={orgLoading || !newOrgName.trim()}
            >
              {orgLoading ? (
                <ActivityIndicator size="small" color={colors.salt} />
              ) : (
                <Text style={styles.smallButtonTextLight}>Create Org</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addOrgButton}
          onPress={() => setIsCreatingOrg(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.ink} />
          <Text style={styles.addOrgButtonText}>Create New Organization</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AuthModal({ visible, onClose }: AuthModalProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const { startSSOFlow } = useSSO();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setErrorMessage(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        oidcPrompt: 'consent select_account',
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        handleClose();
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Google authentication was cancelled or could not be completed.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await clerk.signOut();
      handleClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>Clerk Auth</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isSignedIn ? (
            /* Signed In & Multi-Tenancy View */
            <View style={styles.profileContainer}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={40} color={colors.salt} />
              </View>

              <Text style={[headlineStyle(28), styles.profileTitle]}>
                {user?.firstName ? `Hi, ${user.firstName}!` : 'My Account'}
              </Text>

              {/* User Details */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.ink} />
                  <Text style={styles.cardTitle}>User Information</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gmail / Email</Text>
                  <Text style={styles.infoValue}>
                    {user?.primaryEmailAddress?.emailAddress || 'User'}
                  </Text>
                </View>
                {user?.fullName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{user.fullName}</Text>
                  </View>
                )}
              </View>

              {/* Multi-Tenancy / Organizations Section */}
              <OrgSection />

              <TouchableOpacity
                style={[styles.primaryButton, styles.signOutButton]}
                onPress={handleSignOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.salt} />
                ) : (
                  <>
                    <Ionicons name="log-out-outline" size={20} color={colors.salt} />
                    <Text style={styles.buttonText}>Sign Out</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Google Sign In */
            <View style={styles.formContainer}>
              <Text style={[headlineStyle(32), styles.title]}>Sign In to Buylo</Text>
              <Text style={styles.subtitle}>
                Access your orders, multi-tenant organizations, and faster 12-min delivery.
              </Text>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={colors.coral} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Google SSO Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.ink} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color={colors.ink} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 63, 50, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    backgroundColor: colors.butter,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  brandBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.salt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  formContainer: {
    gap: 16,
  },
  title: {
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.clay,
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.salt,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginTop: 4,
  },
  googleButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(21, 63, 50, 0.12)',
  },
  dividerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.clay,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(21, 63, 50, 0.08)',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: colors.salt,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItemText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.clay,
  },
  tabItemTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.coral,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    backgroundColor: colors.salt,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.salt,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.clay,
  },
  profileContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  profileTitle: {
    color: colors.ink,
  },
  card: {
    width: '100%',
    backgroundColor: colors.salt,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 63, 50, 0.06)',
    paddingBottom: 8,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.clay,
  },
  infoValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  orgActiveBox: {
    backgroundColor: colors.cream,
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  orgActiveName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  orgActiveSlug: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.clay,
  },
  orgList: {
    gap: 8,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.clay,
    textTransform: 'uppercase',
  },
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.salt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.08)',
  },
  orgItemActive: {
    borderColor: colors.coral,
    backgroundColor: '#FFF5F3',
  },
  orgItemText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
  },
  orgItemTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.coral,
  },
  addOrgButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(21, 63, 50, 0.25)',
  },
  addOrgButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  createOrgBox: {
    gap: 10,
    backgroundColor: colors.cream,
    padding: 12,
    borderRadius: 10,
  },
  createOrgActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.salt,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.15)',
  },
  confirmButton: {
    backgroundColor: colors.ink,
  },
  smallButtonTextDark: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  smallButtonTextLight: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.salt,
  },
  signOutButton: {
    width: '100%',
    backgroundColor: colors.coral,
    marginTop: 12,
  },
});
