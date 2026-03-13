import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthContext } from '../context/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';
import { Mail, ArrowRight, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

// ─── Brand icons ──────────────────────────────────────────────────────────────

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

// ─── Email magic link action URL ─────────────────────────────────────────────
// Reads from env; falls back to current origin so the link works in any env
const ACTION_URL = import.meta.env.VITE_FIREBASE_EMAIL_LINK_URL || window.location.origin + '/dashboard';

const EMAIL_KEY = 'keystimate_signin_email';

// ─── Views ────────────────────────────────────────────────────────────────────
const VIEW_PROVIDERS = 'providers';
const VIEW_EMAIL     = 'email';
const VIEW_SENT      = 'sent';

// ─── Main component ───────────────────────────────────────────────────────────

const SignInDialog = ({ open, onClose }) => {
    const { signInWithGoogle, signInWithGithub } = useAuthContext();
    const [view, setView] = useState(VIEW_PROVIDERS);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [sendingLink, setSendingLink] = useState(false);

    const resetState = () => {
        setView(VIEW_PROVIDERS);
        setEmail('');
        setEmailError('');
        setSendingLink(false);
        setLoadingProvider(null);
    };

    const handleClose = () => {
        onClose();
        // Delay reset so dialog closing animation doesn't flash content changes
        setTimeout(resetState, 300);
    };

    // ── OAuth ──
    const handleOAuth = async (provider, fn) => {
        setLoadingProvider(provider);
        try {
            await fn();
            handleClose();
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                toast.error('Sign-in failed', { description: err.message });
            }
        } finally {
            setLoadingProvider(null);
        }
    };

    // ── Email magic link ──
    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handleSendLink = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setEmailError('Enter a valid email address.');
            return;
        }
        setEmailError('');
        setSendingLink(true);
        try {
            await sendSignInLinkToEmail(auth, email, {
                url: ACTION_URL,
                handleCodeInApp: true,
            });
            localStorage.setItem(EMAIL_KEY, email);
            setView(VIEW_SENT);
        } catch (err) {
            toast.error('Could not send link', { description: err.message });
        } finally {
            setSendingLink(false);
        }
    };

    const anyLoading = !!loadingProvider || sendingLink;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">

                {/* ── Providers view ── */}
                {view === VIEW_PROVIDERS && (
                    <>
                        <DialogHeader className="px-6 pt-6 pb-4">
                            <DialogTitle className="text-xl font-black">Sign in</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Sync your profile and history across devices.
                                Your current guest session is unaffected.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-6 pb-6 flex flex-col gap-3">
                            {/* OAuth buttons */}
                            <Button
                                variant="outline"
                                className="h-11 rounded-xl gap-3 font-semibold justify-start pl-4"
                                disabled={anyLoading}
                                onClick={() => handleOAuth('google', signInWithGoogle)}
                            >
                                <GoogleIcon />
                                <span className="flex-1 text-left">
                                    {loadingProvider === 'google' ? 'Signing in…' : 'Continue with Google'}
                                </span>
                                {loadingProvider === 'google' && (
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                className="h-11 rounded-xl gap-3 font-semibold justify-start pl-4"
                                disabled={anyLoading}
                                onClick={() => handleOAuth('github', signInWithGithub)}
                            >
                                <GitHubIcon />
                                <span className="flex-1 text-left">
                                    {loadingProvider === 'github' ? 'Signing in…' : 'Continue with GitHub'}
                                </span>
                                {loadingProvider === 'github' && (
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                )}
                            </Button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 py-1">
                                <Separator className="flex-1" />
                                <span className="text-xs text-muted-foreground font-medium shrink-0">or</span>
                                <Separator className="flex-1" />
                            </div>

                            {/* Email option */}
                            <Button
                                variant="outline"
                                className="h-11 rounded-xl gap-3 font-semibold justify-start pl-4"
                                disabled={anyLoading}
                                onClick={() => setView(VIEW_EMAIL)}
                            >
                                <Mail className="size-4 shrink-0 text-muted-foreground" />
                                <span className="flex-1 text-left">Continue with Email</span>
                            </Button>

                            <p className="text-[11px] text-muted-foreground text-center pt-1">
                                Sign-in is optional — guests work without an account.
                            </p>
                        </div>
                    </>
                )}

                {/* ── Email view ── */}
                {view === VIEW_EMAIL && (
                    <>
                        <DialogHeader className="px-6 pt-6 pb-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setView(VIEW_PROVIDERS); setEmailError(''); }}
                                    className="size-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label="Back"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>
                                <div>
                                    <DialogTitle className="text-xl font-black leading-none">Email sign-in</DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                                        We'll send a magic link — no password needed.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSendLink} className="px-6 pb-6 flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="signin-email"
                                    className="text-xs font-semibold text-muted-foreground"
                                >
                                    Email address
                                </label>
                                <Input
                                    id="signin-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                    className={cn(
                                        "h-11 rounded-xl font-medium",
                                        emailError && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    autoFocus
                                    disabled={sendingLink}
                                    aria-invalid={!!emailError}
                                    aria-describedby={emailError ? 'email-error' : undefined}
                                />
                                {emailError && (
                                    <p id="email-error" className="text-xs text-destructive font-medium">
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="h-11 rounded-xl font-bold gap-2"
                                disabled={sendingLink || !email}
                            >
                                {sendingLink ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        Send magic link
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}

                {/* ── Sent confirmation view ── */}
                {view === VIEW_SENT && (
                    <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
                        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <CheckCircle2 className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <DialogTitle className="text-xl font-black">Check your inbox</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground max-w-[260px] mx-auto">
                                We sent a sign-in link to{' '}
                                <span className="font-semibold text-foreground">{email}</span>.
                                Click it to continue.
                            </DialogDescription>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Didn't get it?{' '}
                            <button
                                className="underline underline-offset-2 hover:text-foreground transition-colors font-medium"
                                onClick={() => setView(VIEW_EMAIL)}
                            >
                                Try again
                            </button>
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-muted-foreground"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
};

export default SignInDialog;

// ─── Email link handler ───────────────────────────────────────────────────────
// Call this once from App.jsx or a route to complete the email sign-in flow
// when the user clicks the magic link.
export const handleEmailSignInLink = async () => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return false;
    let email = localStorage.getItem(EMAIL_KEY);
    if (!email) {
        email = window.prompt('Please re-enter your email to confirm sign-in:');
    }
    if (!email) return false;
    try {
        await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem(EMAIL_KEY);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
    } catch (err) {
        console.error('[Auth] Email link sign-in failed:', err.message);
        toast.error('Sign-in link expired or invalid. Please request a new one.');
        return false;
    }
};
