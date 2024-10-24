import { NextRequest } from 'next/server';
import Mixpanel from 'mixpanel';
import { getCurrentUser } from "@/app/queries/user";
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { kv } from '@/lib/kv';
import { POST } from '@/app/api/mixpanel/route';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
jest.mock('mixpanel', () => {
  return {
    init: jest.fn(() => ({
      track: jest.fn(),
    })),
  };
});
jest.mock('@/app/queries/user', () => ({
  getCurrentUser: jest.fn(),
}));

describe('Mixpanel tracking route', () => {
  let mockRequest: NextRequest;
  let mockMixpanelTrack: jest.Mock;
  let mockCookies: {
    get: jest.Mock;
    set: jest.Mock;
  };
  let mockUser: any;
  
  beforeEach(async() => {
    jest.resetAllMocks();
    mockMixpanelTrack = jest.fn();
    (Mixpanel.init as jest.Mock).mockReturnValue({ track: mockMixpanelTrack });
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);
    (uuidv4 as jest.Mock).mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

    // Mock Request with utm params as property
    mockRequest = {
      json: jest.fn().mockResolvedValue({
        event: 'Test Action',
        properties: { $utm_content: 'test' }
      }),
      headers: new Headers({
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0.0.0'
      }),
    } as unknown as NextRequest;

    mockUser = {
      id: 'a19f7611-5cd2-49b8-ad81-69dc42a2a5a3',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: null,
      lastName: null,
      username: 'zani',
      profileSrc: null,
      tutorialCompletedAt: null,
      wallets: [{
        createdAt: new Date(),
        updatedAt: new Date(),
        address: '8Tj2Lx72kLttL7iCN5dsPQGTUzjQLpyctVcnV9oH8sPM',
        userId: 'a19f7611-5cd2-49b8-ad81-69dc42a2a5a3'
      }]
    };

    await kv.set("utm:550e8400-e29b-41d4-a716-446655440000", {});
    await kv.set("utm:a19f7611-5cd2-49b8-ad81-69dc42a2a5a3", {});
  });

  // Assertion of non-authenticated user event tracking
  it("should track event for non-authenticated user", async () => {
    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
  });

  // Assertion of authenticated user event tracking with mock user
  it("should track event for authenticated user", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
  });

  // Assertion of error handling with mock user error
  it('should handle errors and return Internal Server Error', async () => {
    (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Test error'));

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(responseData).toEqual({ status: 'Internal Server Error' });
  });

  // TEST CASES FOR UTM TRACKING SCENARIOS

  it("UTM Edge Case 1: User visits from Google Search, then signs up", async () => {
    // First visit (pre-login)
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'google', $utm_medium: 'search' }
    });

    let response = await POST(mockRequest);
    let responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmData = await kv.get('utm:550e8400-e29b-41d4-a716-446655440000');
    expect(utmData).toEqual({
      initial_utm: { utm_source: 'google', utm_medium: 'search' },
      last_utm: { utm_source: 'google', utm_medium: 'search' }
    });
    
    // Second visit (post-login)
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'LoginSucceded',
      properties: {}
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmDataPostLogin = await kv.get('utm:a19f7611-5cd2-49b8-ad81-69dc42a2a5a3');
    expect(utmDataPostLogin).toEqual({
      initial_utm: { utm_source: 'google', utm_medium: 'search' },
      last_utm: { utm_source: 'google', utm_medium: 'search' }
    });
  });

  it("UTM Edge Case 2: User visits from Twitter, then later from Telegram and Sign up", async () => {
    // First visit from Twitter
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'twitter', $utm_campaign: 'us_election' }
    });

    let response = await POST(mockRequest);
    let responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmData = await kv.get('utm:550e8400-e29b-41d4-a716-446655440000');
    expect(utmData).toEqual({
      initial_utm: { utm_source: 'twitter', utm_campaign: 'us_election' },
      last_utm: { utm_source: 'twitter', utm_campaign: 'us_election' }
    });

    // Second visit from Telegram
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'telegram', $utm_campaign: 'hacker_house' }
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmDataPreLogin = await kv.get('utm:550e8400-e29b-41d4-a716-446655440000');
    expect(utmDataPreLogin).toEqual({
      initial_utm: { utm_source: 'twitter', utm_campaign: 'us_election' },
      last_utm: { utm_source: 'telegram', utm_campaign: 'hacker_house' }
    });

    // Login Success
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'LoginSucceded',
      properties: { $utm_source: 'telegram', $utm_campaign: 'founders_villa' }
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmDataPostLogin = await kv.get('utm:a19f7611-5cd2-49b8-ad81-69dc42a2a5a3');
    expect(utmDataPostLogin).toEqual({
      initial_utm: { utm_source: 'twitter', utm_campaign: 'us_election' },
      last_utm: { utm_source: 'telegram', utm_campaign: 'founders_villa' }
    });
  });

  it("UTM Edge Case 3: First time UTM is tracked Post-login, then visits again Pre-login", async () => {
    // First footprint on Login Page
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Login Started',
      properties: { $utm_source: 'telegram', $utm_medium: 'community' }
    });

    let response = await POST(mockRequest);
    let responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmData = await kv.get('utm:550e8400-e29b-41d4-a716-446655440000');
    expect(utmData).toEqual({
      initial_utm: { utm_source: 'telegram', utm_medium: 'community' },
      last_utm: { utm_source: 'telegram', utm_medium: 'community' }
    });
    
    // Login Success
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'LoginSucceded',
      properties: { $utm_source: 'telegram', $utm_medium: 'community' }
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmDataPostLogin = await kv.get('utm:a19f7611-5cd2-49b8-ad81-69dc42a2a5a3');
    expect(utmDataPostLogin).toEqual({
      initial_utm: { utm_source: 'telegram', utm_medium: 'community' },
      last_utm: { utm_source: 'telegram', utm_medium: 'community' }
    });

    // Second visit (Pre-login)
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'twitter', $utm_medium: 'social' }
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmDataPreLogin = await kv.get('utm:550e8400-e29b-41d4-a716-446655440000');
    expect(utmDataPreLogin).toEqual({
      initial_utm: { utm_source: 'telegram', utm_medium: 'community' },
      last_utm: { utm_source: 'twitter', utm_medium: 'social' }
    });

    // Third visit (Post-login)
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: {}
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    const utmPostLogin = await kv.get('utm:a19f7611-5cd2-49b8-ad81-69dc42a2a5a3');
    expect(utmPostLogin).toEqual({
      initial_utm: { utm_source: 'telegram', utm_medium: 'community' },
      last_utm: { utm_source: 'twitter', utm_medium: 'social' }
    });
  });
});