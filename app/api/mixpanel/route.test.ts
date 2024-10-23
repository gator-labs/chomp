import { NextRequest } from 'next/server';
import Mixpanel from 'mixpanel';
import { POST } from './route';
import { getCurrentUser } from "@/app/queries/user";
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { kv } from '@/lib/kv';

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
jest.mock('@/lib/kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
  },
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
  
  beforeEach(() => {
    jest.resetAllMocks();
    mockMixpanelTrack = jest.fn();
    (Mixpanel.init as jest.Mock).mockReturnValue({ track: mockMixpanelTrack });
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    (kv.get as jest.Mock).mockResolvedValue(null);
    (kv.set as jest.Mock).mockResolvedValue(undefined);

    mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);
    (uuidv4 as jest.Mock).mockReturnValue('mock-device-id');

    // Mock Request with utm params as property
    mockRequest = {
      json: jest.fn().mockResolvedValue({
        event: 'Test Action',
        properties: { $utm_source: 'test' }
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

  // Test cases for UTM tracking scenarios

  it("should handle normal flow: logged out user visits, then confirms", async () => {
    // First visit (pre-login)
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'google', $utm_medium: 'cpc' }
    });

    let response = await POST(mockRequest);
    let responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    expect(kv.set).toHaveBeenCalledWith('utm:mock-device-id', {
      initial_utm: { utm_source: 'google', utm_medium: 'cpc' },
      last_utm: { utm_source: 'google', utm_medium: 'cpc' }
    });

    // Second visit (post-login)
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (kv.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'utm:mock-device-id') {
        return Promise.resolve({
          initial_utm: { utm_source: 'google', utm_medium: 'cpc' },
          last_utm: { utm_source: 'google', utm_medium: 'cpc' }
        });
      }
      return Promise.resolve(null);
    });

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Signup',
      properties: {}
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });

    // TODO: Assertion for specific Mixpanel event properties
    // expect(mockMixpanelTrack).toHaveBeenCalledWith('Signup', expect.objectContaining({
    //   initial_utm_source: 'google',
    //   initial_utm_medium: 'cpc',
    //   last_utm_source: 'google',
    //   last_utm_medium: 'cpc',
    //   [TRACKING_METADATA.USER_ID]: mockUser.id
    // }));
  });

  it("should handle slow conversion: guest visits from Twitter, then later from Instagram and signs up", async () => {
    // First visit from Twitter
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'twitter', $utm_campaign: 'summer_promo' }
    });

    let response = await POST(mockRequest);
    let responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    expect(kv.set).toHaveBeenCalledWith('utm:mock-device-id', {
      initial_utm: { utm_source: 'twitter', utm_campaign: 'summer_promo' },
      last_utm: { utm_source: 'twitter', utm_campaign: 'summer_promo' }
    });

    // Second visit from Instagram
    (kv.get as jest.Mock).mockResolvedValue({
      initial_utm: { utm_source: 'twitter', utm_campaign: 'summer_promo' },
      last_utm: { utm_source: 'twitter', utm_campaign: 'summer_promo' }
    });

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'instagram', $utm_campaign: 'fall_collection' }
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    expect(kv.set).toHaveBeenCalledWith('utm:mock-device-id', {
      initial_utm: { utm_source: 'twitter', utm_campaign: 'summer_promo' },
      last_utm: { utm_source: 'instagram', utm_campaign: 'fall_collection' }
    });

    // Signup (still logged out)
    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Signup',
      properties: {}
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    // TODO: Assertion for specific Mixpanel event properties
    // expect(mockMixpanelTrack).toHaveBeenCalledWith('Signup', expect.objectContaining({
    //   initial_utm_source: 'twitter',
    //   initial_utm_campaign: 'summer_promo',
    //   last_utm_source: 'instagram',
    //   last_utm_campaign: 'fall_collection'
    // }));
  });

  it("should handle logged in users: first time UTM is tracked when logged in, then signs out from the same device", async () => {
    // First visit (logged in, first time UTM tracked)
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'linkedin', $utm_medium: 'social' }
    });

    let response = await POST(mockRequest);
    let responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    expect(kv.set).toHaveBeenCalledWith(`utm:${mockUser.id}`, {
      initial_utm: { utm_source: 'linkedin', utm_medium: 'social' },
      last_utm: { utm_source: 'linkedin', utm_medium: 'social' }
    });
    // TODO: Assertion for specific Mixpanel event properties
    // expect(mockMixpanelTrack).toHaveBeenCalledWith('Page View', expect.objectContaining({
    //   initial_utm_source: 'linkedin',
    //   initial_utm_medium: 'social',
    //   last_utm_source: 'linkedin',
    //   last_utm_medium: 'social',
    //   [TRACKING_METADATA.USER_ID]: mockUser.id
    // }));

    // Second visit (logged out, same device)
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    (kv.get as jest.Mock).mockResolvedValue({
      initial_utm: { utm_source: 'linkedin', utm_medium: 'social' },
      last_utm: { utm_source: 'linkedin', utm_medium: 'social' }
    });

    mockRequest.json = jest.fn().mockResolvedValue({
      event: 'Page View',
      properties: { $utm_source: 'facebook', $utm_medium: 'cpc' }
    });

    response = await POST(mockRequest);
    responseData = await response.json();

    expect(responseData).toEqual({ status: 'Event tracked successfully' });
    expect(kv.set).toHaveBeenCalledWith('utm:mock-device-id', {
      initial_utm: { utm_source: 'linkedin', utm_medium: 'social' },
      last_utm: { utm_source: 'facebook', utm_medium: 'cpc' }
    });
    // TODO: Assertion for specific Mixpanel event properties
    // expect(mockMixpanelTrack).toHaveBeenCalledWith('Page View', expect.objectContaining({
    //   initial_utm_source: 'linkedin',
    //   initial_utm_medium: 'social',
    //   last_utm_source: 'facebook',
    //   last_utm_medium: 'cpc'
    // }));
  });
});