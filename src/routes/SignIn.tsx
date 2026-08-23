import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Panel, TextField } from '../components/primitives';
import { DEMO_OPERATOR, useOperator } from '../hooks/useOperator';
import { HeroOrbits } from '../components/HeroOrbits';

/**
 * Sign in.
 *
 * There is no backend, so there is nothing to authenticate against and no
 * credential worth collecting. Rather than mock a password field that quietly
 * does nothing, this asks for an email, tells you plainly that no link is sent,
 * and offers a one-click demo operator. The name is kept in localStorage purely
 * to personalise the console's avatar.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useOperator();
  const [email, setEmail] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const valid = EMAIL.test(email);

  const enterAsDemo = () => {
    signIn(DEMO_OPERATOR);
    navigate('/console');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_560px]">
      {/* Decorative side, hidden where it would crowd the form. */}
      <div className="relative hidden overflow-hidden lg:block">
        <HeroOrbits />
        <div className="absolute left-10 top-10 flex flex-col gap-[6px]">
          <Link to="/" className="text-lg font-semibold tracking-[0.04em] text-primary">
            KESSLER
          </Link>
          <div className="label">Orbital conjunction screening</div>
        </div>
        <div className="absolute bottom-10 left-10 max-w-[420px]">
          <p className="text-xl leading-[1.6] text-secondary [text-wrap:pretty]">
            Screening should not be a procurement decision.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-6 p-6 lg:p-10">
        <div className="flex flex-col gap-2 lg:hidden">
          <Link to="/" className="text-lg font-semibold tracking-[0.04em] text-primary">
            KESSLER
          </Link>
        </div>

        <div>
          <h1 className="text-4xl font-semibold tracking-tighter text-primary">Sign in</h1>
          <p className="mt-3 max-w-[420px] text-md leading-[1.65] text-secondary [text-wrap:pretty]">
            Operators sign in with a work email. Screening thresholds and asset registers are
            scoped to a workspace.
          </p>
        </div>

        <Panel>
          <form
            className="flex flex-col gap-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              setTouched(true);
              if (valid) setSent(true);
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="label">Work email</span>
              <TextField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="flight.dynamics@operator.org"
                aria-invalid={touched && !valid}
                className="h-[38px] px-3"
              />
              {touched && !valid && (
                <span className="font-mono text-2xs tracking-data text-risk-critical">
                  Enter a valid email address
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="label">Workspace (optional)</span>
              <TextField
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="e.g. cubesat-lab"
                className="h-[38px] px-3"
              />
            </label>

            <Button type="submit" variant="primary" className="w-full py-[10px] text-base">
              Email me a sign-in link
            </Button>

            {sent && (
              <div className="rounded border border-risk-medium bg-[color:var(--accent-wash)] p-4">
                <div className="font-mono text-2xs uppercase tracking-label text-risk-medium">
                  Nothing was sent
                </div>
                <p className="mt-2 text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
                  This prototype has no backend and makes no network requests, so no link can be
                  delivered to <span className="font-mono text-primary">{email}</span>. Use the demo
                  operator below to carry on into the console.
                </p>
              </div>
            )}
          </form>
        </Panel>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-hairline" />
          <span className="label">or</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <Button onClick={enterAsDemo} className="w-full py-[10px] text-base">
          Continue as demo operator
        </Button>

        {/* Deliberate, prominent disclosure — same treatment as the detail view's. */}
        <div className="overflow-hidden rounded-md border border-risk-medium">
          <div className="flex h-9 items-center gap-[9px] border-b border-risk-medium bg-[color:var(--accent-wash)] px-[14px]">
            <span className="h-2 w-2 rounded-xs bg-risk-medium" />
            <span className="font-mono text-xs- uppercase tracking-label text-risk-medium">
              No authentication happens here
            </span>
          </div>
          <p className="glass bg-panel p-[14px] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
            Nothing you type is checked, transmitted or stored as a credential. There is no account
            system behind this prototype. Signing in only sets a display name in this browser so the
            console has something to show in the avatar.
          </p>
        </div>

        <Link to="/console" className="text-sm text-accent hover:text-primary">
          Skip and open the console →
        </Link>
      </div>
    </div>
  );
}
