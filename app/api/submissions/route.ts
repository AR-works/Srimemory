import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, createSubmission } from '@/lib/db/repository';
import { isSAuthenticatedFromRequest } from '@/lib/auth/pin';
import { ContributorSubmissionPayload } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Only S can view the submissions
  const isAuth = isSAuthenticatedFromRequest(request);
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Unauthorized. Please enter S secret PIN.' },
      { status: 401 }
    );
  }

  try {
    const submissions = await getAllSubmissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching memories 💔' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContributorSubmissionPayload;

    if (!body || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please write a little message for S before submitting 💜' },
        { status: 400 }
      );
    }

    if (body.message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is a bit too long (maximum 5,000 characters).' },
        { status: 400 }
      );
    }

    const payload: ContributorSubmissionPayload = {
      name: body.name?.trim(),
      isAnonymous: Boolean(body.isAnonymous),
      message: body.message.trim(),
      files: Array.isArray(body.files) ? body.files : [],
    };

    const submission = await createSubmission(payload);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: "It's in 💜 S has one more reason to smile now.",
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Something went wrong while saving that 💔 Try again in a moment.' },
      { status: 500 }
    );
  }
}
