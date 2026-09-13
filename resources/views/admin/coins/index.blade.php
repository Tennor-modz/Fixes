@extends('layouts.admin')

@section('title')
    Coin Requests
@endsection

@section('content-header')
    <h1>Drex Hosting Coins <small>Review user coin requests.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Coin Requests</li>
    </ol>
@endsection

@section('content')
    <div class="box">
        <div class="box-header with-border">
            <h3 class="box-title">Pending Requests</h3>
            <a href="{{ route('admin.users') }}" class="btn btn-sm btn-primary pull-right">Manage Users</a>
        </div>
        <div class="box-body table-responsive no-padding">
            <table class="table table-hover">
                <thead><tr><th>User</th><th>Amount</th><th>Reason</th><th>Requested</th><th>Actions</th></tr></thead>
                <tbody>
                @forelse($requests as $coinRequest)
                    <tr>
                        <td>{{ $coinRequest->user->username }}<br><small>{{ $coinRequest->user->email }}</small></td>
                        <td><strong>{{ $coinRequest->amount }}</strong> coins</td>
                        <td>{{ $coinRequest->reason }}</td>
                        <td>{{ $coinRequest->created_at->diffForHumans() }}</td>
                        <td>
                            <form action="{{ route('admin.coins.approve', $coinRequest) }}" method="POST" style="display:inline-block">
                                {!! csrf_field() !!}
                                <button class="btn btn-success btn-xs" type="submit">Approve</button>
                            </form>
                            <form action="{{ route('admin.coins.deny', $coinRequest) }}" method="POST" style="display:inline-block">
                                {!! csrf_field() !!}
                                <button class="btn btn-danger btn-xs" type="submit">Deny</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="text-center text-muted">No pending coin requests.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
        <div class="box-footer">{{ $requests->links() }}</div>
    </div>
@endsection
